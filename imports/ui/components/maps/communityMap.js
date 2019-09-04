import { Maps } from '../../../api/maps/Maps.js';
import { Communities } from '../../../api/communities/Communities.js';
import {map,loadMap,addLayer} from '../../components/maps/leaflet.js'
import './communityMap.html'

let mapsData = {};
let selection;
let selectedLayer;

Template.CommunityMap.onCreated(function(){
  console.log("CommunityMap: onCreated()");
  let rootMap ='GLOBAL';
  const handles = [
    this.subscribe('maps.key.children',rootMap),
    this.subscribe("communities.all")
  ];
  Tracker.autorun(() => {
    const areReady = handles.every(handle => handle.ready());
    console.log(`Handles are ${areReady ? 'ready' : 'not ready'}`);
    if(areReady){
      mapsData = buildGeoJSON("GLOBAL");
      loadGeoJSON(mapsData);
      addInfoControl();
      addCommunityControl();
    }
  });
});

Template.CommunityMap.onRendered(function(){
  console.log("CommunityMap: onRendered()");
  loadMap();
  addLayer();
});

Template.CommunityMap.events({

});

Template.CommunityMap.helpers({

});

//custom FUNCTIONS
function loadGeoJSON(){
  //start with the global map (i.e. load countries)
  //var mapsData = buildGeoJSON("GLOBAL");
  mapLayer = new L.geoJSON(mapsData,{
    style: mapStyle,
    onEachFeature: mapOnEachFeature
  });
  mapLayer.addTo(map);
  //console.log(mapLayer.getBounds());
  map.fitBounds(mapLayer.getBounds());

  // handle clicks on the map that didn't hit a feature
  map.addEventListener('click', function(e) {
    Session.set('selectedMap','GLOBAL');
    if (selection) {
      resetStyles();
      selection = null;
      //document.getElementById('summaryLabel').innerHTML = '<p>Click a garden or food pantry on the map to get more information.</p>';
    }
    L.DomEvent.stopPropagation(e);
  });

}

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
//zoom and centeres in on selected map
function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}
//makes selections pretty
function mapStyle(feature) {
  return {
    fillColor: "#616161",
    fillOpacity: 0.2,
    color: '#8c8c8c',
    stroke: true,
    weight: 1
  };
}
function mapSelectedStyle(feature) {
  return {
    fillColor: "#ff8f8f",
    color: '#ff6363',
    fillOpacity: 0.2,
    stroke: true,
    weight: 1
  };
}

// handle click events on map features
function mapOnEachFeature(feature, layer){
  layer.on({
    click: function(e) {
      communityInfo.update(e.target.feature.properties);
      if (selection) {
        resetStyles();
        //console.log(e.target.feature.properties.rootMap);
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
      Session.set('selectedMap',selection.feature.properties.key);
      //console.log(selection.feature);
      /* THIS LOADS CHILD MAPS
      let rootMap = selection.feature.properties.key;
      if(Maps.find({"properties.rootMap":rootMap}).count()){
        loadNewLayer(rootMap);
      }
      */
      // Insert some HTML with the feature name
      //buildSummaryLabel(feature);

      L.DomEvent.stopPropagation(e); // stop click event from being propagated further
    },
    mouseover: function(e) {
      //console.log(e.target.feature.properties.iso3166key);
      highlightFeature(e);
    },
    mouseout: function(e) {
      layer.setStyle(mapStyle());
      info.update();

    }
  });
}

function loadNewLayer(rootMap){
  //console.log("rootMap: " + rootMap);
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
function highlightFeature(e) {
  //console.log(e.target.feature.properties)
	info.update(e.target.feature.properties);
  var layer = e.target;

  layer.setStyle({
      weight: 1,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.7
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
  }
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
