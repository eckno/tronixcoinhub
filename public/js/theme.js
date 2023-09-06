;(function($) {
    "use strict";    
        
    //* counter--up.js
    function counterUp() {
        if ($('.counterup-section').length) { 
            $('.counter').counterUp({
                delay: 10,
                time: 3000, 
            });
        };
    };

    
    // owlCarousel 
    function servicesCarousel (){
        if ($('.testimonials-section, .testimonials-section_two, .blog-section').length){
            $('.testimonial_wraper').owlCarousel({
                loop:true,
                margin:30,
                nav:true,
                dots:true,
                dot:true,
                autoplay:true,
                autoplayTimeout:2500,
                item: 1,
                smartSpeed:2000,
                navigation: true,
                navText: ["<i class='far fa-chevron-left'></i>","<i class='far fa-chevron-right'></i>"],
                responsive:{
                    0:{
                        items:1
                    },
                    768:{
                        items:2
                    },
                    1000:{
                        items:3
                    }
                }
            })
            $('.testimonial_wraper_two').owlCarousel({
                loop:true,
                margin:30,
                nav:true,
                dots:true,
                dot:true,
                autoplay:true,
                autoplayTimeout:2500,
                item: 1,
                smartSpeed:2000,
                navigation: true,
                navText: ["<i class='far fa-chevron-left'></i>","<i class='far fa-chevron-right'></i>"],
                responsive:{
                    0:{
                        items:1
                    },
                    768:{
                        items:1
                    },
                    1000:{
                        items:2
                    }
                }
            })
            $('.brand-slider').owlCarousel({
                loop:true,
                margin:30,
                nav:false,
                dots:false,
                dot:false,
                autoplay:true,
                autoplayTimeout:4000,
                item: 5,
                smartSpeed:3000,
                responsive:{
                    0:{
                        items:1
                    },
                    320:{
                        items:1
                    },
                    575:{
                        items:2
                    },
                    1000:{
                        items:5
                    }
                }
            })
            
            $('.images-slider').owlCarousel({
                loop:true,
                margin:30,
                nav:true,
                dots:false,
                item: 3,
                navigation: true,
                navText: ["<i class='fal fa-chevron-left'></i>","<i class='fal fa-chevron-right'></i>"],
                responsive:{
                    0:{
                        items:1
                    },
                    768:{
                        items:2
                    },
                    1000:{
                        items:1
                    }
                }
            })
        }
    }
    // magnificPopup 
    function magnifiPopup (){
        if ($('.popup-youtube').length){
            $('.popup-youtube').magnificPopup({
                disableOn: 700,
                type: 'iframe',
                mainClass: 'mfp-fade',
                removalDelay: 160,
                preloader: false,
                fixedContentPos: false
            });
        }
    }



    // mobile menu js 
    $('.open-menu').click( function (){
                  
		$('body').addClass('activee');  
	});

	$('.close-menu').click( function (){
		  
		$('body').removeClass('activee'); 
    });

    // search modal js 
    $('.search_btn').click( function (){
                  
		$('body').addClass('search-activee');  
	});

	$('.search_close, .search_overlay').click( function (){
		  
		$('body').removeClass('search-activee'); 
    });

    var swiper = new Swiper(".mySwiper", {
        direction: "vertical",
        slidesPerView: 3,
        autoplay:true,
        loop:true,
        speed: 2000,
        spaceBetween: 10,
        mousewheel: true,
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
        },
    });


    /*Function Calls*/ 
    counterUp();  
    servicesCarousel ();
    magnifiPopup ();
    new WOW().init();
})(jQuery); 
