(function ($) {
  $.fn.sortable = function (settings) {

	var scrollParent;
	var sortableObject = $(this);
	var offsetTop = $(this).offset().top;

	var sortComplete = function () {
		$$.trigger("sort:complete");
	};

	var log = function (msg, min_level) {
		if (config.debugLevel > min_level) {
			console.log('[jquery.sort.js] ' + msg);
		}
	};
	
	var config = {
		debugLevel				: 0,

		scroll					: true,
		sortElement				: 'li',
		handle					: '.handle',
		dragElementCenter		: false,

		scrollSensitivity		: 40,
		scrollSpeed				: 20,
		scrollParentClass		: '.scrolling-el',

		constrain				: false,
		constrainMarginTop		: 0,
		constrainMarginBottom	: 0,
		
		//callbacks
		moveComplete			: sortComplete
	};

	if (settings) {
		$.extend(config, settings);
	}


	log('[loaded]', 1);


	//add elements with constraint margin heights, so as to measure them with the proper applied style
	//this lets us accept em's, for instance, instead of requiring px
	var cmt_el = $('<div style="position:absolute; height:' + config.constrainMarginTop + '"/>');
	$(sortableObject).prepend(cmt_el);
	$.extend(config, {_cmt: cmt_el.height()});
	cmt_el.remove();

	var cmb_el = $('<div style="position:absolute; height:' + config.constrainMarginBottom + ';"/>');
	$(sortableObject).append(cmb_el);
	$.extend(config, {_cmb: cmb_el.height()});
	cmb_el.remove();


	log('[constraint margins] top:' + config._cmt + '; bottom:' + config._cmb, 1);

	
	//Requires sortable object to have a unique id; add one if not present- made unique by referencing object y position
	if(!sortableObject.attr("id")) {
		objId = "sortable" + offsetTop;
		objId = objId.split(".")[0];
		sortableObject.attr("id", objId);
	}
	
	//build drop zone limiter for proper scoping
	var sortScope = "#" + sortableObject.attr("id") + " > " + config.sortElement;
	
	//since we're using an absolutely position proxy during dragging, we'll need the parent to have a declared position
	sortElement = $(this).find(config.sortElement);
	if ($(this).css('position') !== 'absolute' && $(this).css('position') !== 'fixed') {
		$(this).css('position', 'relative');
	}

	sortElement
	
			.drag('dragstart', function (ev, dd) {
				log('[dragstart]', 2);

				//requires handle
				if (!$(ev.target).is(config.handle)) {
					return false;
				}

				sortableObject.addClass('sorting');

				//locate and name nested scroll-y parent in the dom, if present
				scrollParent = $(this).parents().filter(config.scrollParentClass)[0];
				
				//copy the dragged item so you'll see it as you drag. Make it semi-translucent
				//$(this).clone().addClass('active').css({opacity: 0.8, position: "absolute"}).insertAfter(this);
				$(this).clone().addClass('active').css({'position': 'absolute', 'border': '1px solid black', 'background': 'white', 'z-order': 100}).insertAfter(this);

				//hide the currently dragged item
				$(this).addClass('active-drag-item').css('opacity', 0.05);

			})
			.drag(function (ev, dd) {
				
				//used for scrolling only (supports only vertical scrolling)
				if (config.scroll) {	
					if (scrollParent) {
						//scroll parent container that has y-overflow: scroll; lazy recogniztion of this container via class
						if(($(scrollParent).offset().top + scrollParent.offsetHeight) - ev.pageY < config.scrollSensitivity) {
							scrollParent.scrollTop = scrolled = scrollParent.scrollTop + config.scrollSpeed;
						} else if(ev.pageY - $(scrollParent).offset().top < 40) {
							scrollParent.scrollTop = scrolled = scrollParent.scrollTop - config.scrollSpeed;
						}
						
					} else {
						//scoll document
						if(ev.pageY - $(document).scrollTop() < config.scrollSensitivity) {
							$(document).scrollTop($(document).scrollTop() - config.scrollSpeed);
						} else if($(window).height() - (ev.pageY - $(document).scrollTop()) < config.scrollSensitivity) {
							$(document).scrollTop($(document).scrollTop() + config.scrollSpeed);
						}
					}
				}


				//move the cloned element along with the mouse. Not tested across all browsers yet...
				var projected_top = (dd.offsetY - offsetTop) - (config.dragElementCenter ? ($('.active').height()/2) : 0);

				var constraint_top = config._cmt; //offsetTop + $('.active').height();
				var constraint_bottom = $(sortableObject).height() - config._cmb; //offsetTop + $(sortableObject).height() - $('.active').height();
			
				if (!config.constrain || (projected_top >= constraint_top && (projected_top + $('.active').height()) <= constraint_bottom)) {
					$('.active').css({top: projected_top});
				}

				log('[drag] projected_top:'+projected_top+'; constraint_top:'+constraint_top+'; constraint_bottom:'+constraint_bottom, 3);


				var drop = dd.drop[0],
				method = $.data( drop || {}, 'drop+reorder' );
				if (drop && ( drop !== dd.current || method !== dd.method)){	
					$( this )[ method ]( drop );
					dd.current = drop;
					dd.method = method;
					dd.update();
				}

			}, {drop: sortScope})
			
			.drag('end', function (ev, dd) {
				log('[dragend]', 2);

				$(this).css('opacity', 1);

				sortableObject.removeClass('sorting');
				sortableObject.find('.active').remove();
				$(this).removeClass('active-drag-item');

				config.moveComplete();
			})
			
			.drop('init',function (ev, dd) {
				//log('[init]', 2);
				return (this !== dd.drag);
			});	
			
		$.drop({
			tolerance: function (event, proxy, target) {
				var test = event.pageY > (target.top + target.height / 3.2);
				$.data(target.elem, 'drop+reorder', test ? 'insertAfter' : 'insertBefore');	
				return this.contains(target, [event.pageX, event.pageY]);
			}
		});

  };

}(jQuery));
