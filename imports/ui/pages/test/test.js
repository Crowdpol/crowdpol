//import './amchart.js';
//import './leaflet.js';
import './test.html';
import './test.scss';

Template.Test.onCreated(function(){
  //console.log("Test: onCreated()");
});

Template.Test.onRendered(function(){
  //console.log("Test: onRendered()");
  $(window).scroll( fancyFunction );
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
