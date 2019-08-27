import './maps.html'
import { Communities } from '../../../../api/communities/Communities.js'
import { Maps } from '../../../../api/maps/Maps.js'
import RavenClient from 'raven-js';
let dataSet1 = {};
let dataSet2 = {};
let map = null;
let selection;
let selectedLayer;
let mapLayer;
var mapsData;
let running = false;

Template.AdminMaps.onCreated(function(){
  self = this;
  //Local Storage
  var communityId = LocalStore.get('communityId');
  var dict = new ReactiveDict();
	self.dict = dict;
  dict.set('communityId',communityId);
  Session.set('selectedCommunity','Global');
  Session.set('selectedMap','GLOBAL');
  Session.set('breadcrumbs',['GLOBAL']);
  self.autorun(function() {
    //self.subscribe("maps.all");
    self.subscribe("communities.all");
    dataSet1.sub = self.subscribe("maps.all");
    dataSet1.ready = new ReactiveVar(false);
    // autorun for getting the data and handling it
    Tracker.autorun(() => {
      if(dataSet1.sub.ready()) {
        // process dataset1
        // after processing set ready variable
        dataSet1.ready.set(true);
        //console.log("data is ready");
      }
    });
    //console.log(dataSet1.ready);
    if(dataSet1.sub.ready()) {
      //console.log("calling load map");
      //console.log("mapCount: " + Maps.find().count());
      mapsData = buildGeoJSON("GLOBAL");

      //load geoJSON from DB
      loadGeoJSON();
    }
  });

});

Template.AdminMaps.onRendered(function(){
  loadMap(LocalStore.get('communityId'));
});

Template.AdminMaps.events({
  /*
	'keyup #some-id': function(event, template){
		Session.set('searchPhrase',event.target.value);
	},
  */
  'click .clear-form': function(event, template){
    event.preventDefault();
    document.getElementById("map-form").reset();
    document.getElementById("geojson-form").reset();
  },
  'click #save-form': function(event,template){
    event.preventDefault();
    let mapId = $("#mapId").val()
    let properties = {
	     "key": $("#mapKey").val(),
	     "rootMap": $("#mapRootMap").val(),
	     "communityId": $("#community").val(),
	     "rootCommunityId": $("#rootCommunity").val(),
       "name": $("#mapName").val(),
	  }
    console.log(properties);
    Meteor.call('updateMapProperties', mapId,properties, function(error){
			if (error){
				Bert.alert(error.reason, 'danger');
			} else {
				Bert.alert("Map updated",'success');
			}
		});
  },
  'click #save-geojson': function(event,template){
    event.preventDefault();
    let geoJSON = JSON.parse($("#mapJSON").val());
    let maps = geoJSON.maps;
    _.each(maps, function(map,index){
        //console.log(index + " " + map);

        Meteor.call('addMap', map, function(error){
    			if (error){
    				Bert.alert(error.reason, 'danger');
    			} else {
    				Bert.alert("Map added",'success');
    			}
    		});

    });

  }
});

Template.AdminMaps.helpers({
	selectedMap: function(){
    let selectedMap = Session.get('selectedMap');
    //console.log(selectedMap)
    return selectedMap;
  },
  breadcrumbs: function(){
    let breadcrumbs = Session.get('breadcrumbs');
    //console.log(breadcrumbs);
    return breadcrumbs;
  },
  communities: function(){
    return Communities.find();
  },
  isSelectedCommunity: function(id){
    let communityId = Template.instance().dict.get('communityId');
    if(communityId==id){
      return true;
    }
    return false;
  },
  childCommunities: function(){
    let selectedCommunity = Template.instance().dict.get('communityId');
    return Communities.find({'parentCommunity':selectedCommunity});
  },
  isSelectedChildCommunity: function(id){
    return false;
  },
});

function loadMap(communityId){
  //let geojsonFeature = buildGeoJSON();
  L.Icon.Default.imagePath = '/packages/bevanhunt_leaflet/images/';

  //create map
  map = L.map('community-map', {
    doubleClickZoom: false,
    zoomControl: false,
    zoom: 3,
    minZoom: 2,
    center: [49.009952, 2.548635],
    //        maxBounds: [[-90.0,-180.0],[90.0,180.0]]
    maxBounds: [
        [-85.0, -180.0],
        [85.0, 180.0]
    ]
  });
  //set starting view
  map.setView([62.54114431714147, 16.192131042480472], 3);

  //set zoom controls
  L.control.zoom({
     position:'bottomleft'
  }).addTo(map);

  //load base tiles map, to see more: https://leaflet-extras.github.io/leaflet-providers/preview/
  var tiles = L.tileLayer.provider('Esri.WorldGrayCanvas')
  tiles.addTo(map);

  L.Map.include({
  	panInsideBounds: function(bounds) {
  		bounds = L.latLngBounds(bounds);

  		var viewBounds = this.getBounds(),
  		    viewSw = this.project(viewBounds.getSouthWest()),
  		    viewNe = this.project(viewBounds.getNorthEast()),
  		    sw = this.project(bounds.getSouthWest()),
  		    ne = this.project(bounds.getNorthEast()),
  		    dx = 0,
  		    dy = 0,
  		    cp;	// compensate for projection (only works for map mercator)

  	 	if (viewNe.y < ne.y) { // north
  			cp = this.latLngToContainerPoint([85.05112878, 0]).y;
  			dy = ne.y - viewNe.y + (cp > 0 ? cp : 0);
  		}
  		if (viewNe.x > ne.x) { // east
  			dx = ne.x - viewNe.x;
  		}
  		if (viewSw.y > sw.y) { // south
  			cp = this.latLngToContainerPoint([-85.05112878, 0]).y - this.getSize().y;
  			dy = sw.y - viewSw.y + (cp < 0 ? cp : 0);
  		}
  		if (viewSw.x < sw.x) { // west
  			dx = sw.x - viewSw.x;
  		}
    }
  });



}

function loadGeoJSON(){
  //start with the global map (i.e. load countries)
  //var mapsData = buildGeoJSON("GLOBAL");
  //console.log('starting to load geojson, map should have built by now');
  //console.log(mapsData);
  mapLayer = new L.geoJSON(mapsData,{
    style: mapStyle,
    onEachFeature: mapOnEachFeature
  });

  mapLayer.addTo(map);
  //console.log(mapLayer.getBounds());
  map.fitBounds(mapLayer.getBounds());
  /*
  // handle clicks on the map that didn't hit a feature
  map.addEventListener('click', function(e) {
    console.log("map clicked");
    if (selection) {
      resetStyles();
      selection = null;
      document.getElementById('summaryLabel').innerHTML = '<p>Click a garden or food pantry on the map to get more information.</p>';
    }
  });
  */
}

//accepts root map iso code and returns geoJSON object of child maps
function buildGeoJSON(rootMap){
  //console.log("buildGeoJSON started");
  let maps = Maps.find({"properties.rootMap":rootMap}).fetch();
  let geoJSON = null;
  let mapCollection = [];
  //console.log("maps.length: " + maps.length);
  if(maps.length){
    _.each(maps, function(map,index){
      let thisMap = map;
      let type = map.geometry.type;

      if(type=='MultiPolygon'){
        //console.log("multi");
        thisMap = {
          "type":"Feature",
          "properties":map.properties,
          "geometry":{
            "type":map.geometry.type,
            "coordinates": map.geometry.multiCoordinates
          }
        }
        //console.log(thisMap);
      }else{
        //console.log("poly")
      }
      //if(type=='Polygon'){
        mapCollection.push(thisMap)
      //}
    });
    geoJSON = {
      "type": "FeatureCollection",
      "features": mapCollection
    }
  }else{
    console.log("maps query is of 0 length");
  }
  //console.log("finished building geojson");
  return geoJSON;
}


function mapStyle(feature) {
  return {
    fillColor: "#616161",
    fillOpacity: 0.2,
    color: '#8c8c8c',
    stroke: false,
    weight: 1
  };
}
function mapSelectedStyle(feature) {
  return {
    fillColor: "#ff8f8f",
    color: '#ff6363',
    fillOpacity: 0.2,
    stroke: false,
    weight: 1
  };
}

// handle click events on map features
function mapOnEachFeature(feature, layer){
  layer.on({
    click: function(e) {
      //console.log(e.target.feature.properties.iso3166key);
      if (selection) {
        resetStyles();
        console.log(e.target.feature.properties.rootMap);
        map.eachLayer(function(layer){
          if(layer.feature){
            /*
            if(e.target.feature.properties.rootMap!==layer.feature.properties.rootMap){
              map.removeLayer(layer);
            }
            */
            //console.log
            //console.log(layer.feature.properties.iso3166key);
          }

        });
      }
      zoomToFeature(e);
      e.target.setStyle(mapSelectedStyle());
      selection = e.target;
      //let breadcrumbs = Session.get('breadcrumbs');
      //breadcrumbs.push(selection.feature.properties.iso3166key);
      //Session.set('breadcrumbs',breadcrumbs);
      selectedLayer = mapLayer;
      Session.set('selectedMap',selection.feature);
      //console.log(selection.feature);
      /* THIS LOADS CHILD MAPS
      let rootMap = selection.feature.properties.iso3166key;
      if(Maps.find({"properties.rootMap":rootMap}).count()){
        loadNewLayer(rootMap);
      }
      */
      // Insert some HTML with the feature name
      buildSummaryLabel(feature);

      L.DomEvent.stopPropagation(e); // stop click event from being propagated further
    },
    mouseover: function(e) {
      //console.log(e.target.feature.properties.iso3166key);
    },
    mouseout: function(e) {
      //console.log(e);
    }
  });
}

// function to build the HTML for the summary label using the selected feature's "name" property
function buildSummaryLabel(currentFeature){
  var featureName = currentFeature.properties.name || "Unnamed feature";
  document.getElementById('summaryLabel').innerHTML = '<p style="font-size:18px"><b>' + featureName + '</b></p>';
}
// function to set the old selected feature back to its original symbol. Used when the map or a feature is clicked.
function resetStyles(){
  /*
  console.log("check if selectedLayer === mapLayer");
  console.log("selectedLayer:");
  console.log(selectedLayer);
  console.log("mapLayer:");
  console.log(mapLayer);
  */
  if(selectedLayer === mapLayer){
    selectedLayer.resetStyle(selection);
  }
}


function loadNewLayer(rootMap){
  //console.log(Maps.find({"properties.rootMap":rootMap}).count());
  let maps = Maps.find({"properties.rootMap":rootMap});
  let geoJSON = buildGeoJSON(rootMap);
  //console.log(geoJSON);
  var newLayer = new L.geoJSON(geoJSON,{
    style: mapStyle,
    onEachFeature: mapOnEachFeature
  });

  newLayer.addTo(map);
  /*
  map.eachLayer(function(layer){
    if(layer.feature){
      //console.log
      //console.log(layer.feature.properties.iso3166key);
    }

  });
  */
}
function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

/* THIS IS USED TO SHOW MOUSEOVER EFFECTS
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
function resetHighlight(e,layer) {
    layer.resetStyle(e.target);
}
*/
