import { Proposals } from '../../../api/proposals/Proposals.js';
import { Communities } from '../../../api/communities/Communities.js'
import { Maps } from '../../../api/maps/Maps.js';
import './communityNav.html'

let map = null;
let geojson = null;

Template.CommunityNav.onCreated(function(){
  self = this;
  //Local Storage
  var communityId = LocalStore.get('communityId');
  Session.set('selectedCommunity','Global');
  self.autorun(function() {
    self.subscribe("maps.children",communityId);
    //self.subscribe("maps.all");
  });
});

Template.CommunityNav.onRendered(function(){
  console.log("hello");
  self.autorun(function() {
     let mapCount = Maps.find().count();
     if(mapCount){
       loadMap(LocalStore.get('communityId'));
     }
  });


});

Template.CommunityNav.events({
  /*
	'keyup #some-id': function(event, template){
		Session.set('searchPhrase',event.target.value);
	},
  'click .some-class': function(event, template){
    var communityId = Template.instance().templateDictionary.get( 'communityId' );
    delegateId = this._id;
    var ranks = Session.get('ranked');
    let settings = LocalStore.get('settings');
    let delegateLimit = -1;

    if(typeof settings != 'undefined'){
      //do something
    }
    Meteor.call('someMethod', someParameter, function(error, result){
      if(error) {
        RavenClient.captureException(error);
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert(TAPi18n.__('pages.delegates.alerts.ranking-updated'), 'success');
      }
    });
  },
  */
});

Template.CommunityNav.helpers({
  mapCount: function(){
    return Maps.find().count();
  },
	selectedCommunity: function(){
    return Session.get('selectedCommunity');
  },
  openProposals: function(isVotingAsDelegate) {
    var communityId = LocalStore.get('communityId');
    let now = moment().toDate();//new Date();
    let end = now;
    //TO DO: add option for admin to select delgate expiry date (currently 14 days before end date)
    if(isVotingAsDelegate){
      end =  moment(now).subtract(2, 'weeks').toDate();//now.setDate(now.getDate()-14).toString();
    }

    return Proposals.find({stage: "live"}, {sort: {endDate: 1,createdAt:-1}},{transform: transformProposal});
  },
});

function loadMap(communityId){
  let geojsonFeature = buildGeoJSON();
  L.Icon.Default.imagePath = '/packages/bevanhunt_leaflet/images/';

  map = L.map('community-map', {
    doubleClickZoom: false,
    zoomControl: false,
    //minZoom: 3
  }).setView([62.54114431714147, 16.192131042480472], 3);

  L.control.zoom({
     position:'bottomleft'
  }).addTo(map);

  L.tileLayer.provider('Esri.WorldGrayCanvas').addTo(map);

  map.createPane('continents');
  map.getPane('continents').style.zIndex = 650;
  map.getPane('continents').style.pointerEvents = 'none';
  var style = {
    fillColor: 'grey',
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7
  }
  /* GEOJSON */
  geojson = L.geoJSON(geojsonFeature,{
    style: style,
    onEachFeature: onEachFeature
  }).addTo(map);

  geojson.eachLayer(function (layer) {
    console.log(layer);
    //Session.set('selectedCommunity',layer.feature.properties.CONTINENT);
    layer.bindPopup(layer.feature.properties.iso3166key);
    //click: whenClicked
  });

  map.on('dblclick', function(event) {
    console.log(event.latlng);
  });
  console.log(geojson.getBounds());
  map.fitBounds(geojson.getBounds());


  /*
  map.setMaxBounds(geojson.getBounds());
  console.log(map.getBounds().toString());
  console.log(map.getBounds().getSouthWest().toString());
  console.log(map.getBounds().getNorthEast().toString());
  *

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition,showError);
  } else {
    console.log("Geolocation is not supported by this browser.");
  }

  // add clustermarkers
  var markers = L.markerClusterGroup();
  map.addLayer(markers);
  //console.log(markers);
  /*
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

  });*/
}

function buildGeoJSON(){
  let maps = Maps.find().fetch();
  let geoJSON = null;
  if(maps.length){
    console.log("maps.length: " + maps.length);
    /*let features = [];
    _.each(maps, function(map){
      let feature = {
        "type": "Feature",
        "properties": {
          "iso3166key": map.properties.iso3166key,
          "rootMap":"",
          "communityId":map.properties.communityId,
          "rootCommunityId":map.properties.rootCommunityId
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [map.geometry.coordinates]
        }
      }
      features.push(feature);
    });*/
    geoJSON = {
      "type": "FeatureCollection",
      "features": maps
    }
  }else{
    console.log("maps query is of 0 length");
  }
  return geoJSON;
}


function showPosition(position) {
  console.log("Latitude: " + position.coords.latitude +
  "<br>Longitude: " + position.coords.longitude);
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

function transformProposal(proposal) {
  var currentLang = TAPi18n.getLanguage();
  var endDate = proposal.endDate;
  var startDate = proposal.startDate;
  //Put dates in ISO format so they are compatible with moment
  endDate = endDate.toISOString();
  startDate = startDate.toISOString();
  proposal.endDate = endDate;
  proposal.startDate = startDate;
  var content = proposal.content;
  content.forEach(function (lang, index) {
    if(lang.language==currentLang){

      //var langContent = {
        proposal.title = lang.title
        proposal.abstract =lang.abstract;
        proposal.body = lang.body;
        proposal.pointsAgainst = lang.pointsAgainst;
        proposal.pointsFor = lang.pointsFor;
      //}
      //proposal.langContent = langContent;
    }
  });
  return proposal;
};

function whenClicked(e) {
  // e = event
  console.log("whenClicked triggered");
  console.log(e.sourceTarget.feature.properties.communityId);
  // You can make your ajax call declaration here
  //$.ajax(...
}

function onEachFeature(feature, layer) {
    console.log("onEachFeature called");
    //bind click
    /*
    layer.on({
        click: whenClicked,
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
    */

    layer.on('click', function(e) {
      // Do whatever you want here, when the polygon is clicked.
      console.log(e.sourceTarget.feature.properties);
    });
}
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}
function resetHighlight(e) {
    geojson.resetStyle(e.target);
}
function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}
