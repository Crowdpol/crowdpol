import {map,loadMap,addLayer} from '../../components/maps/leaflet.js'
//import './amchart.js';
//import './leaflet.js';
import L from 'leaflet';
import './test.html';
import './test.scss';

//let steps = [];

Template.Test.onCreated(function(){
  //console.log("Test: onCreated()");
});

Template.Test.onRendered(function(){
  /*
  let els = document.getElementsByClassName('step');

  Array.prototype.forEach.call(els, (e) => {
    steps.push(e);
    /*
    e.addEventListener('click', (x) => {
      progress(x.target.id);
    });

  });
*/

});
  /*
function progress(stepNum) {

  let p = stepNum * 30;
  document.getElementsByClassName('percent')[0].style.width = `${p}%`;
  steps.forEach((e) => {
    if (e.id === stepNum) {
      e.classList.add('selected');
      e.classList.remove('completed');
    }
    if (e.id < stepNum) {
      e.classList.add('completed');
    }
    if (e.id > stepNum) {
      e.classList.remove('selected', 'completed');
    }
  });

}
  */
Template.Test.events({
  /*
  'click .step': function(e){
    console.log(e.currentTarget.id);
    progress(e.currentTarget.id);
  },

  'click .test-header': function(e){
    console.log("click test-header");
    e.preventDefault();
      $('html, body').animate({
          scrollTop: $("#test-footer-id").offset().top
      }, 600);
  }*/
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
