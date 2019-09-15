import { Maps } from '../../../api/maps/Maps.js';
import { Communities } from '../../../api/communities/Communities.js';
import { setCommunity } from '../../../utils/community';
import {map,loadMap,addLayer} from '../../components/maps/leaflet.js'
import './communityMap.html'

let selection;
let currentRoot='GLOBAL';

Template.CommunityMap.onCreated(function(){
  //console.log("CommunityMap: onCreated()");
  const handles = [
    this.subscribe('maps.all'),//,rootMap),
    this.subscribe("communities.all")
  ];
  Tracker.autorun(() => {
    const areReady = handles.every(handle => handle.ready());
    //console.log(`Handles are ${areReady ? 'ready' : 'not ready'}`);
    if(areReady){
      loadGeoJSON();
      addInfoControl();
      addCommunityControl();
    }
  });
});

Template.CommunityMap.onRendered(function(){
  loadMap();
});

Template.CommunityMap.events({

});

Template.CommunityMap.helpers({

});

//custom FUNCTIONS
function loadGeoJSON(){
  //start with the global map (i.e. load countries)
  var greyscaleMap = L.tileLayer.provider('Esri.WorldGrayCanvas');
  var streetMap = L.tileLayer.provider('Esri.WorldStreetMap');
  var mapsData = buildGeoJSON(currentRoot);
  mapLayer = new L.geoJSON(mapsData,{
    style: mapStyle,
    onEachFeature: mapOnEachFeature
  });
  addLayer(greyscaleMap);
  addLayer(streetMap);
  addLayer(mapLayer);
  //streetMap.addTo(map);
  //mapLayer.addTo(map);
  var baseMaps = {
    "Streets": streetMap,
  	"Greyscale": greyscaleMap
  };

  var overlayMaps = {
      "Communities": mapLayer
  };
  //var group = new L.LayerGroup([streetMap, mapLayer]);
  //group.addTo(map);
  L.control.layers(baseMaps, overlayMaps).addTo(map);

  //console.log(mapLayer.getBounds());
  //map.fitBounds(mapLayer.getBounds());

  /*
  // handle clicks on the map that didn't hit a feature

  map.addEventListener('click', function(e) {

    Session.set('selectedMap','GLOBAL');
    if (selection) {
      resetStyle();
      selection = null;
      //document.getElementById('summaryLabel').innerHTML = '<p>Click a garden or food pantry on the map to get more information.</p>';
    }

    L.DomEvent.stopPropagation(e);
  });
  */
}

function buildGeoJSON(){
  //console.log("buildGeoJSON started");
  let maps = Maps.find({"properties.rootMap":currentRoot}).fetch();
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
//zoom and centeres in on selected map
function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}


// handle click events on map features
function mapOnEachFeature(feature, layer){
  layer.on({
    click: function(e) {
      //load community info onto map
      communityInfo.update(e.target.feature.properties);
      //reset previous selected layer styles
      if (selection) {
        selection.setStyle(mapStyle());
      }
      zoomToFeature(e);
      //style selected map
      e.target.setStyle(mapSelectedStyle());
      selection = e.target;
      Session.set('selectedMap',selection.feature);

      /* THIS LOADS CHILD MAPS*/
      currentRoot = selection.feature.properties.key;
      let childMapCount = Maps.find({"properties.rootMap":currentRoot}).count();
      if(childMapCount){
        loadNewLayer();
      }else{
        console.log("no children, leave map layer as is");
      }
      // Insert some HTML with the feature name
      //buildSummaryLabel(feature);

      L.DomEvent.stopPropagation(e); // stop click event from being propagated further
    },
    mouseover: function(e) {
      if(layer!==selection){
        hoverStyle(e);
      }
    },
    mouseout: function(e) {
      resetStyle(layer);
      info.update();

    }
  });
}

function loadNewLayer(){
  if(map.hasLayer(mapLayer)) {
    map.removeLayer(mapLayer);
  }

  let geoJSON = buildGeoJSON();

  mapLayer = new L.geoJSON(geoJSON,{
    style: mapStyle,
    onEachFeature: mapOnEachFeature
  });

  mapLayer.addTo(map);

}

/*---------------------------------------------------------------*/
/*                MAP CONTROLS                                   */
/*---------------------------------------------------------------*/
function buildSummaryLabel(currentFeature){
  var featureName = currentFeature.properties.name || "Unnamed feature";
  document.getElementById('summaryLabel').innerHTML = '<p style="font-size:18px"><b>' + featureName + '</b></p>';
}

function addCommunityControl(){
  //add community control
  communityInfo = L.control({position: 'bottomright'});

  communityInfo.onAdd = function (map) {
  	this._div = L.DomUtil.create('div', 'map-community-info'); // create a div with a class "info"
  	this.update();
  	return this._div;
  };

  // method that we will use to update the control based on feature properties passed
  communityInfo.update = function (props) {
    if(props){
      let proposalCount = 0;
      let delegateCount = 0;
      let groupCount = 0;
      let memberCount = 0;
      let community = Communities.findOne({"_id":props.communityId});
      if(community){
        LocalStore.set('communityId',community._id);
        setCommunity(community._id);
      }
      //console.log(community);
    	this._div.innerHTML = (community ?
        //'<div style="background-image:'+community.settings.homepageImageUrl+'" class="map-community-info-header"></div>'+
        '<table>'+
          '<tr><td>Community</td><th>'+community.name+'</th></tr>'+
          //'<tr><td>Members</td><th>'+memberCount+'</th></tr>'
          //'<tr><td>Proposals</td><th>'+proposalCount+'</th></tr>'+
          //'<tr><td>Groups</td><th>'+groupCount+'</th></tr>'+
          //'<tr><td>Delegates</td><th>'+delegateCount+'</th></tr>'+
        '</table>'
    		: '<b>' + props.name + '</b> has no community yet.<br><a href="#">Request One</a>');
    }
  };

  communityInfo.addTo(map);
}

function addInfoControl(){
  //add hover control
  info = L.control();

  info.onAdd = function (map) {
  	this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
  	this.update();
  	return this._div;
  };

  // method that we will use to update the control based on feature properties passed
  info.update = function (props) {
  	this._div.innerHTML = (props ?
  		'<b>' + props.name + '</b> (' + props.key + ')'
  		: 'Hover over a community');
  };

  info.addTo(map);
}
/*---------------------------------------------------------------*/
/*                MAP STYLES                                     */
/*---------------------------------------------------------------*/
//this is the default color of all loaded communities
function mapStyle(feature) {
  return {
    fillColor: "#c9c9c9",
    fillOpacity: 0.2,
    color: '#8c8c8c',
    stroke: true,
    weight: 1
  };
}
//this is the style of the selected community on mouse click
function mapSelectedStyle(feature) {
  return {
    fillColor: "#f76020",
    color: '#852800',
    fillOpacity: 0.4,
    stroke: true,
    weight: 1
  };
}

// function to set the old selected feature back to its original symbol. Used when the map or a feature is clicked.
function resetStyle(layer){
  if(layer!==selection){
    layer.setStyle(mapStyle());
  }
}

function hoverStyle(e) {
  //console.log(e.target.feature.properties)
	info.update(e.target.feature.properties);
  var layer = e.target;

  layer.setStyle({
      color: '#8c8c8c',
      fillColor: "#ff753b",
      fillOpacity: 0.7,
      stroke: true,
      weight: 1
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
  }
}

/*---------------------------------------------------------------*/
/*                EXPORT FUNCTION                                */
/*---------------------------------------------------------------*/

export function loadCommunityMap(id){
  let layerMap = Maps.findOne({"properties.communityId":id});
  if(layerMap){
    currentRoot = layerMap.properties.key;

  }else{
    currentRoot = 'GLOBAL';
    console.log("no map");
  }
  loadNewLayer(currentRoot);
  let bounds = mapLayer.getBounds();
  if(bounds){
    map.fitBounds(mapLayer.getBounds());
  }else{
    console.log('could not find layer map bounds');
  }

}

export function currentMap(){
  return Maps.findOne({"properties.key":currentRoot});
}
