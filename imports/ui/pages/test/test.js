//import './amchart.js';
//import './leaflet.js';
import L from 'leaflet';
import './test.html';
import './test.scss';

Template.Test.onCreated(function(){
  //console.log("Test: onCreated()");
});

Template.TestLanding.onRendered(function(){
  //console.log("Test: onRendered()");
  //$(window).scroll( fancyFunction );
  $('#fader img:not(:first)').hide();
    //$('#fader img').css('position', 'absolute');
    //$('#fader img').css('top', '0px');
    //$('#fader img').css('left', '50%');
    $('#fader img').each(function() {
        var img = $(this);
        $('<img>').attr('src', $(this).attr('src')).load(function() {
            //img.css('margin-left', -this.width / 2 + 'px');
        });
    });

    var pause = false;

    function fadeNext() {
        $('#fader img').first().fadeOut();
        $('#fader img').first().fadeIn();
    }

    function fadePrev() {
        $('#fader img').first().fadeOut();
        $('#fader img').last().fadeIn();
    }

    $('#fader, #next').click(function() {
        fadeNext();
    });

    $('#prev').click(function() {
        fadePrev();
    });

    $('#fader, .button').hover(function() {
        pause = true;
    },function() {
        pause = false;
    });

    function doRotate() {
        if(!pause) {
            fadeNext();
        }
    }

    var rotate = setInterval(doRotate, 2000);
});

Template.Test.events({
  'click .test-header': function(e){
    console.log("click test-header");
    e.preventDefault();
      $('html, body').animate({
          scrollTop: $("#test-footer-id").offset().top
      }, 600);
  }
});

Template.Test.helpers({

});

function fancyFunction() {
  console.log("fancy function called");
  if ($(window).scrollTop() > 50) {
    // do somethign
    console.log("scrollto greater than 50");
  } else {
    // do some other thing
    console.log("scrollto less than 50");
  }
}
