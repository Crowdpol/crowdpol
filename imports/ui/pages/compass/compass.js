
import './compass.html';

Template.Compass.onCreated(function(){
  self = this;
  //Reactive Variables
  self.currentStep = new ReactiveVar([]);
  self.currentStep.set("1");
});

Template.Compass.onRendered(function(){
  //loadMap();
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition,showError);
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
});

Template.Compass.helpers({

});

Template.Compass.events({
  'click .compass-skip' (event, template){
    event.preventDefault();
    FlowRouter.go('/dash/vote');
  },
	'click .compass-next' (event, template){
		event.preventDefault();
    $( "#change-photo" ).show();
		template.currentStep.set(moveStep(template.currentStep.get(),1));
	},
  'click .compass-back' (event, template){
		event.preventDefault();
		template.currentStep.set(moveStep(template.currentStep.get(),-1));
	},
  'click .compass-complete' (event, template){
    event.preventDefault();

    FlowRouter.go('/dash/vote');
  }
});

/*
** -1 for back, 1 for forwards
*/
function moveStep(currentStep,direction){;
  let nextStep = direction + parseFloat(currentStep);
  let currentStepSelector = '*[data-section="'+currentStep+'"]';
  let nextStepSelector = '*[data-section="'+nextStep+'"]';
  $(currentStepSelector).hide();
  $(nextStepSelector).show();
  return nextStep;
}
/*
Template.Compass.rendered = function() {
  L.Icon.Default.imagePath = '/packages/bevanhunt_leaflet/images/';

  var map = L.map('compass-map', {
    doubleClickZoom: false
  //}).setView([49.25044, -123.137], 2);
  }).setView([62.54114431714147, 16.192131042480472], 3);
  L.tileLayer.provider('Esri.WorldGrayCanvas').addTo(map);

  map.on('dblclick', function(event) {
    console.log(event.latlng);
  });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition,showError);
  } else {
    console.log("Geolocation is not supported by this browser.");
  }

  // add clustermarkers
  var markers = L.markerClusterGroup();
  map.addLayer(markers);
  //console.log(markers);

  var query = Markers.find();
  query.observe({
    added: function (document) {
      var marker = L.marker(document.latlng)
        .on('click', function(event) {
          Markers.remove({_id: document._id});
        });
       markers.addLayer(marker);
    },
    removed: function (oldDocument) {
      layers = map._layers;
      var key, val;
      for (key in layers) {
        val = layers[key];
        if (val._latlng) {
          if (val._latlng.lat === oldDocument.latlng.lat && val._latlng.lng === oldDocument.latlng.lng) {
            markers.removeLayer(val);
          }
        }
      }
    }

  });
};*/

function showPosition(position) {
  let coords = [ position.coords.latitude,position.coords.longitude];
  console.log(coords)
  //var marker = L.marker(coords).addTo(map);
  //map.panTo(new L.LatLng(position.coords.latitude,position.coords.longitude));
}

function showError(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      console.log("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      console.log("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      console.log("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      console.log("An unknown error occurred.");
      break;
  }
}
