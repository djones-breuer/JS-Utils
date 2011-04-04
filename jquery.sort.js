(function( $ ){
  $.fn.sortable = function(settings) {
  
	var scrollParent; 
	var sortableObject = $(this); 
	var offsetTop = $(this).offset().top; 

	var sortComplete = function() {
		$$.trigger("sort:complete");
	}; 
	
	var config = {
		scroll			   : true,
		sortElement		   : 'li',
		handle			   : '.handle',
		scrollSensitivity  : 40, 
		scrollSpeed		   : 20, 
		scrollParentClass  : '.scrolling-el', 
		
		//callbacks
		moveComplete	   : sortComplete
		
	};

	if (settings) {
		$.extend(config, settings);
		
	}
	
	//Requires sortable object to have a unique id; add one if not present- made unique by referencing object y position 
	if(!sortableObject.attr("id")) {
		objId = "sortable"+offsetTop;
		objId = objId.split(".")[0];
		sortableObject.attr("id", objId);
	}
	
	//build drop zone limiter for proper scoping
	var sortScope = "#"+sortableObject.attr("id")+" > "+config.sortElement;
	
	//since we're using an absolutely position proxy during dragging, we'll need the parent to have a declared position
	sortElement = $(this).find(config.sortElement);
	if ($(this).css('position') !='absolute' && $(this).css('position') != 'fixed') {
		$(this).css('position', 'relative')
    }

		sortElement
		
				.drag('dragstart', function(ev, dd) {
					
					sortableObject.addClass('sorting');
					
					//requires handle 
					if (!$(ev.target).is(config.handle)) { return false; }
					
					//locate and name nested scroll-y parent in the dom, if present
					scrollParent = $(this).parents().filter(config.scrollParentClass)[0]; 
					
					//copy the dragged item so you'll see it as you drag. Make it semi-translucent 
					$(this).clone().addClass('active').css({opacity: .8, position: "absolute"}).insertAfter(this);
					//hide the currently dragged item
					$(this).css('opacity', .2);
				
				})
				.drag(function( ev, dd ){
					
					//used for scrolling only (supports only vertical scrolling)
					if (config.scroll) {	
						if (scrollParent) {
							//scroll parent container that has y-overflow: scroll; lazy recogniztion of this container via class
							if(($(scrollParent).offset().top + scrollParent.offsetHeight) - ev.pageY < config.scrollSensitivity)
								scrollParent.scrollTop = scrolled = scrollParent.scrollTop + config.scrollSpeed;
							else if(ev.pageY - $(scrollParent).offset().top < 40)
								scrollParent.scrollTop = scrolled = scrollParent.scrollTop - config.scrollSpeed;
							
						} else {
							//scoll document
							if(ev.pageY - $(document).scrollTop() < config.scrollSensitivity)
								$(document).scrollTop($(document).scrollTop() - config.scrollSpeed);
							else if($(window).height() - (ev.pageY - $(document).scrollTop()) < config.scrollSensitivity)
								$(document).scrollTop($(document).scrollTop() + config.scrollSpeed);
						}
					} 
					//move the cloned element along with the mouse. Not tested across all browsers yet...
					$('.active').css({top: dd.offsetY - offsetTop});	
		
					var drop = dd.drop[0],
					method = $.data( drop || {}, 'drop+reorder' );
					if (drop && ( drop != dd.current || method != dd.method)){	
						$( this )[ method ]( drop );
						dd.current = drop;
						dd.method = method;
						dd.update();
					}
				}, { drop: sortScope})
				
				.drag('end',function( ev, dd ){		
					$(this).css('opacity', 1);
					sortableObject.removeClass('sorting');
					sortableObject.find('.active').remove();  
					config.moveComplete();
				})
				
				.drop('init',function(ev, dd){
					return !(this == dd.drag);
				});	
				
			$.drop({
				tolerance: function( event, proxy, target ){
				
					var test = event.pageY > ( target.top + target.height / 3.2 );
					$.data( target.elem, 'drop+reorder', test ? 'insertAfter' : 'insertBefore' );	
					return this.contains( target, [ event.pageX, event.pageY ] );
				}
			});

  };

})( jQuery );
