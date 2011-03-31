(function( $ ){
  $.fn.sortable = function(settings) {
  
	var config = {
		scroll			   : true,
		sortElement		   : "li",
		handle			   : '.handle',
		scrollSensitivity  : 40, 
		scrollSpeed		   : 20, 
		scrollParentClass  : '.scrolling-el'
	};
	
	var scrolled = 0; 
	var scrollParent; 
	

	if (settings) {
		$.extend(config, settings);
		
	}
	
	sortElement = $(this).find(config.sortElement);
	if ($(this).css("position") !="absolute" && $(this).css("position") != "fixed") {
		$(this).css("position", "relative")
    }

		sortElement
		
				.drag("dragstart", function(ev, dd) {
	
					if (!$(ev.target).is(config.handle)) { return false; }
					scrollParent = $(this).parents().filter(config.scrollParentClass)[0]; 
						
					if (config.scroll && scrollParent) { scrolled = scrollParent.scrollTop; }
					
					//copy the dragged item so you'll see it as you drag. Make it semi-translucent 
					$(this).clone().addClass("active").css("opacity", .8).insertAfter(this);
					//hide the currently dragged item
					$(this).css("opacity", 0);
					console.log(dd);
					
				})
				.drag(function( ev, dd ){
			
					// in tests, including halfHandle in the eq made up for containers w/ margins 
					var halfHandle = $(this).find(".handle").outerHeight(true) / 2 ; 
					
					//scrolling
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
					//move the cloned element along with the mouse
					$(".active").css({top: dd.deltaY - halfHandle + scrolled});	
					
					var drop = dd.drop[0],
					method = $.data( drop || {}, "drop+reorder" );
					if ( drop && ( drop != dd.current || method != dd.method ) ){	
						$( this )[ method ]( drop );
						dd.current = drop;
						dd.method = method;
						dd.update();
					}
				})
				
				.drag("end",function( ev, dd ){		
					$( this ).css("opacity", 1);
					$(".active").remove(); //scope 
				})
				
				.drop("init",function( ev, dd ){
					return !( this == dd.drag );
				});	
				
			$.drop({
				tolerance: function( event, proxy, target ){
					var test = event.pageY > ( target.top + target.height / 3.2 );
					$.data( target.elem, "drop+reorder", test ? "insertAfter" : "insertBefore" );	
					return this.contains( target, [ event.pageX, event.pageY ] );
				}
			});

  };
})( jQuery );
