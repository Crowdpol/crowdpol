import {map,loadMap,addLayer} from '../../../components/maps/leaflet.js'
import RavenClient from 'raven-js';
import './signupWizard.html';

Template.SignupWizard.onRendered(function(){
  $("#leaflet-map").hide();
});

Template.SignupWizard.events({
  'click .step-circle': function(e){
    $("#leaflet-map").show( "fast", function() {
      map.invalidateSize();
      map.setView([37.000,-120.652], 1);
    });
  }
});
