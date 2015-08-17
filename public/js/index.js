$(function(){
  // carousel demo
//    $('#myCarousel').carousel({
//      'pause' : 'false',
//      'interval' : 7000
//    });

//      $('#nav').onePageNav({
//        currentClass: 'current',
//        // changeHash: false,
//        // scrollSpeed: 750,
//        scrollOffset: 0,
//        scrollThreshold: 0,
//        // filter: '',
//        // easing: 'swing',
//        begin: function() {
//          //I get fired when the animation is starting
//        },
//        end: function() {
//          //I get fired when the animation is ending
//        },
//        scrollChange: function($currentListItem) {
//          //I get fired when you enter a section and I pass the list item of the section
//        }
//      });
  var container = document.querySelector('#articles');
  var msnry     = new Masonry( container, {
    // options
    itemSelector: '.article'
  });

  $('#nav a').click(function() {
    var elementClicked = $(this).attr("href");
    var destination    = $(elementClicked).offset().top;

    $("html:not(:animated),body:not(:animated)").animate({ scrollTop: destination}, 500 );

    return false;
  });

//  $(window).scroll(function(){
//    if ($(window).scrollTop() > 20) {
//      $('.navbar-wrapper').css('margin-top','0');
//    } else {
//      $('.navbar-wrapper').css('margin-top','20px');
//    }
//  });

  $('.scrollable').click(function(){
    var target = $(this).attr('href');
    $('html').scrollTo( target, 800 );

    return false;
  });

//    var $width = 0;
//    var $max   = Math.max.apply(Math, $('.nav-link').map(function(){ return $(this).width(); }).get());
//
//    $('#navigation-container').find('a').hover(function() {
//      $width = $(this).width();
//
//      $(this).animate({
//        width: $max
//      }, 400);
//    }, function() {
//      $(this).animate({
//        width: $width
//      }, 400);
//    });

//  $('#navigation-container').find('a').hover(function() {
//    $(this).stop().animate({
//      'paddingLeft': '1.2em',
//      'paddingRight': '1.2em'
//    }, 'fast');
//  }, function() {
//    $(this).stop().animate({
//      'paddingLeft': '0.5em',
//      'paddingRight': '0.5em'
//    }, 'fast');
//  });
});