import { Maps } from '../../../api/maps/Maps.js';
import { Proposals } from '../../../api/proposals/Proposals.js';
import { Communities } from '../../../api/communities/Communities.js';
import { Groups } from '../../../api/group/Groups.js';
import { setCommunity } from '../../../utils/community';
import RavenClient from 'raven-js';
import './communityDash.html';

//declare global variables:
let mapDataSet = {};
let communitiesDataSet = {};
let map = null;
let selection;
let selectedLayer;
let mapLayer;
var mapsData;
let info;
let communityInfo;


Template.CommunityDash.onCreated(function(){
  self = this;
  var communityId = LocalStore.get('communityId');
  var dict = new ReactiveDict();
	self.dict = dict;
  self.openGroup = new ReactiveVar(true);
  dict.set('communityId',communityId);
  Session.set('selectedCommunity','Global');
  Session.set('selectedMap','GLOBAL');
  Session.set('breadcrumbs',['GLOBAL']);
  self.autorun(function() {
    //self.subscribe("maps.all");
    //self.subscribe("communities.all");
    self.subscribe("communities.all");//communityId);
    self.subscribe("groups.community",LocalStore.get('communityId'));
    self.subscribe("proposals.community",LocalStore.get('communityId'));
    //self.subcribe("users.community",LocalStore.get('communityId'));
    mapDataSet.sub = self.subscribe("maps.all");
    mapDataSet.ready = new ReactiveVar(false);
    // autorun for getting the data and handling it
    Tracker.autorun(() => {
      if(mapDataSet.sub.ready()) {
        // process dataset1
        // after processing set ready variable
        mapDataSet.ready.set(true);
        //console.log("data is ready");
      }
    });
    //console.log(dataSet1.ready);
    if(mapDataSet.sub.ready()) {
      //console.log("calling load map");
      //console.log("mapCount: " + Maps.find().count());
      mapsData = buildGeoJSON("GLOBAL");

      //load geoJSON from DB
      loadGeoJSON();
    }
  });

});

Template.CommunityDash.onRendered(function(){
  loadMap(LocalStore.get('communityId'));
  $('.mdl-layout__tab').on('click', function() {
	$this = $(this);
  if($this.hasClass('is-active')) return;

  $parent = $this.closest('.mdl-layout__tab-bar');
  $('.mdl-layout__tab', $parent).removeClass('is-active');
  $this.addClass('is-active');
})
  /* TODO: Standardise form validation
  $( "#create-group-form" ).validate({
    rules: {
      'group-name': {
        required: true
      },
      'group-username': {
        required: true
      },
    },
    messages: {
      'group-name': {
        required: 'Please enter a group name.'
      },
      'group-username': {
        required: 'Please enter a group username.'
      },
    }
  });
  */

});

Template.CommunityDash.events({
  'click .sidebar-nav': function(event,template){
    event.preventDefault();
    $('.sidebar-nav').each(function(i, obj) {
      $(this).removeClass('active');
    });
    $(event.target).addClass('active');
    let id = "#" + event.target.dataset.id;
    console.log("id: " + id);
    $('.tabcontent').each(function(i, obj) {
      $(this).removeClass('active');
    });
    $(id).addClass('active');
  },
  'click .community-card-image': function(event, template){
    let id = event.currentTarget.dataset.id;
    if(id){
      setCommunity(id);
      tabcontent = document.getElementsByClassName("community-tab");
      for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
      }
      $("#communities-tab").show();
      $('*[data-tab="communities-tab"]').addClass("active");

      /*
      LocalStore.set('communityId', id);
      let settings = LocalStore.get('settings');
      let defaultLang = "en";
      if(typeof settings.defaultLanguage){
        console.log(settings);
        defaultLang = settings.defaultLanguage;
      }
      console.log("defaultLang: " + defaultLang);
      Session.set("i18n_lang",defaultLang)
      //TAPi18n.setLanguage(defaultLang);
      /* TODO: change locale dynamically*/
      //moment.locale(defaultLang);
    }
    /*
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
    */
  },
  'click .tablinks': function(event, template){
    let tab = event.currentTarget.dataset.tab;
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("community-tab");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tab).style.display = "flex";
    event.currentTarget.className += " active";
  },
  'click .create-group': function(event, template){
    openCreateGroupModal()
  },
  'click #overlay, click #reject-button' (event, template){
    closeCreateGroupModal();
  },
  'click #group-open': function(event, template){
    template.openGroup.set(!template.openGroup.get());
  },
  'click #create-group': function(event, template){
    event.preventDefault();
    let group = {
      name: $("#group-name").val(),
      handle: $("#group-username").val(),
      isOpen: template.openGroup.get(),
      communityId: LocalStore.get('communityId'),
      isArchived: false
    }
    console.log(group);
    if(group.name == ''){
      Bert.alert("Name required","danger");
      return false;
    }
    if(group.handle == ''){
      Bert.alert("Username required","danger");
      return false;
    }

    Meteor.call('addGroup', group, function(error, result){
      if(error) {
        RavenClient.captureException(error);
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert("Group created","success");
        //Bert.alert(TAPi18n.__('pages.delegates.alerts.ranking-updated'), 'success');
      }
    });
  },
  'click .group-card': function(event, template){
    event.preventDefault();
  }
});

Template.CommunityDash.helpers({
  communityMembers: function(){
    var communityId = LocalStore.get('communityId');
    return Meteor.users.find({"profile.communityIds" : communityId})
  },
  currentCommunity: function(){
    var communityId = LocalStore.get('communityId');
    let community = Communities.findOne({"_id":communityId});
    if(community){
      return community;
    }
  },
	childCommunities: function(){
    var communityId = LocalStore.get('communityId');
    return Communities.find({"parentCommunity":communityId});
  },
  childCommunitiesCount: function(){
    var communityId = LocalStore.get('communityId');
    return Communities.find({"parentCommunity":communityId}).count();
  },
  communityGroupCount: function(){
    return 1;
  },
  delegatesCount: function(){
    return 1;
  },
  backgroundImage: function(community){
    if(community){
      if(typeof community.settings !== 'undefined'){
        let settings = community.settings;
        //console.log(settings);
        if(typeof settings.homepageImageUrl !== 'undefined');{
          //console.log(settings.homepageImageUrl);
          return settings.homepageImageUrl;
        }
      }
    }
    return 'url(https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjUxNTY3fQ&w=1500&dpi=2';
  },
  groups: function(){
    //console.log("Groups count: " + Groups.find().count());
    return Groups.find({communityId:LocalStore.get('communityId')});
  },
  currentCommunityProposalCount: function(){
    var communityId = LocalStore.get('communityId');
    return Proposals.find({stage: "live",communityId:LocalStore.get('communityId')}).count();
  },
  openProposals: function(isVotingAsDelegate) {
    var communityId = LocalStore.get('communityId');
    let now = moment().toDate();//new Date();
    let end = now;
    //TO DO: add option for admin to select delgate expiry date (currently 14 days before end date)
    if(isVotingAsDelegate){
      end =  moment(now).subtract(2, 'weeks').toDate();//now.setDate(now.getDate()-14).toString();
    }

    return Proposals.find({stage: "live",communityId:LocalStore.get('communityId')}, {sort: {endDate: 1,createdAt:-1}},{transform: transformProposal});
  },
  currentCommunity: function(){
    return Communities.findOne({"_id":LocalStore.get('communityId')});
  }
});

openCreateGroupModal = function(event) {
  $(".create-group-modal").addClass('active');
  $("#overlay").addClass('dark-overlay');
}

closeCreateGroupModal = function(event) {
  $(".create-group-modal").removeClass('active');
  $("#overlay").removeClass('dark-overlay');
}
/*
Template.CreateGroupModal.events({
  'click #create-group': function(event, template){
    event.preventDefault();
    console.log("creating group");
  }
})
*/


//--------------------------------------------------------------------------------------------------------------//
//MAP FUNCTIONS
//--------------------------------------------------------------------------------------------------------------//
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
  //tiles.addTo(map);

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

  addInfoControl();
  addCommunityControl();
}

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
      /* THIS LOADS CHILD MAPS*/
      let rootMap = selection.feature.properties.key;
      if(Maps.find({"properties.rootMap":rootMap}).count()){
        loadNewLayer(rootMap);
      }

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
        '<div style="background-image:'+community.settings.homepageImageUrl+'" class="map-community-info-header"></div>'+
        '<table>'+
          '<tr><td>Community</td><th>'+community.name+'</th></tr>'+
          '<tr><td>Members</td><th>'+memberCount+'</th></tr>'+
          '<tr><td>Proposals</td><th>'+proposalCount+'</th></tr>'+
          '<tr><td>Groups</td><th>'+groupCount+'</th></tr>'+
          '<tr><td>Delegates</td><th>'+delegateCount+'</th></tr></table>'
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
//--------------------------------------------------------------------------------------------------------------//
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

function openPage(pageName,elmnt,color) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablink");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].style.backgroundColor = "";
  }
  document.getElementById(pageName).style.display = "block";
  elmnt.style.backgroundColor = color;
}
