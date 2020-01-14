import './leaflet.html'

export let map;

Template.Leaflet.onCreated(function(){
  //console.log("Leaflet onCreated");
});

Template.Leaflet.events({
  'click #leaflet-zoom-in': function(event, template){
    console.log("zoom in");
    map.setZoom(map.getZoom() + 1)
  },
  'click #leaflet-zoom-out': function(event, template){
    console.log("zoom out");
    map.setZoom(map.getZoom() - 1)
  },
});

Template.Leaflet.helpers({

});

export function loadMap(){
  //console.log("Leaflet: loadMap()");

  //L.Icon.Default.imagePath = '/packages/bevanhunt_leaflet/images/';

  //create map - more settings options: https://leafletjs.com/reference-1.5.0.html#map-option
  map = L.map('leaflet-map', {
    doubleClickZoom: false,
    zoomControl: false,
    zoom: 3,
    minZoom: 1,
    center: [49.009952, 2.548635],
    //        maxBounds: [[-90.0,-180.0],[90.0,180.0]]
    maxBounds: [
        [-85.0, -180.0],
        [85.0, 180.0]
    ]
  });

  //L.tileLayer.provider('Esri.WorldGrayCanvas').addTo(map)
  /*
  //set zoom controls
  L.control.zoom({
     position:'bottomleft'
  }).addTo(map);
  */
  setTiles();

}

//this will set the limits of where a user can scroll on the map
function limitPanBounds(){
  console.log("Leaflet: limitPanBounds()");
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

//set starting view
function setStartingPosition(){
  //console.log("Leaflet: setStartingPosition()");
  map.setView([62.54114431714147, 16.192131042480472], 3);
}
//set base tile layer of the map
function setTiles(){
  console.log("Leaflet: setTiles()");
  //load base tiles map, to see more: https://leaflet-extras.github.io/leaflet-providers/preview/

  //var tiles = L.tileLayer.provider('Esri.WorldGrayCanvas')
  var Esri_WorldStreetMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
  	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
  });
  Esri_WorldStreetMap.addTo(map);

}
export function addLayer(layer){
  //console.log("Leaflet: addLayer()");
  //console.log(layer);
  layer.addTo(map);
}
