import './maps.html'
import { Communities } from '../../../../api/communities/Communities.js'
import { Maps } from '../../../../api/maps/Maps.js'
import {map,loadMap,addLayer} from '../../../components/maps/leaflet.js'
import RavenClient from 'raven-js';

let selection;
let currentRoot='GLOBAL';

Template.AdminMaps.onCreated(function(){
  self = this;
  //Local Storage
  var communityId = LocalStore.get('communityId');
  var dict = new ReactiveDict();
	self.dict = dict;
  dict.set('communityId',communityId);
  Session.set('selectedCommunity','Global');
  Session.set('selectedMap','GLOBAL');

});

Template.AdminMaps.onRendered(function(){
  //loadMap();
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
        //console.log(map.geometry.coordinates)
        console.log(map.properties.key + ' ' + getdim(map.geometry.coordinates));

        Meteor.call('addMap', map, function(error){
    			if (error){
    				Bert.alert(error.reason, 'danger');
    			} else {
    				Bert.alert("Map added",'success');
    			}
    		});
    });

  },
  'change #rootCommunity': function(event,template){
    let id = $("#rootCommunity").val();
    Template.instance().dict.set('communityId',id);
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


// Assumes a valid matrix and returns its dimension array.
// Won't work for irregular matrices, but is cheap.
function dim(mat) {
    if (mat instanceof Array) {
        return [mat.length].concat(dim(mat[0]));
    } else {
        return [];
    }
}

// Makes a validator function for a given matrix structure d.
function validator(d) {
    return function (mat) {
        if (mat instanceof Array) {
            return d.length > 0
                && d[0] === mat.length
                && every(mat, validator(d.slice(1)));
        } else {
            return d.length === 0;
        }
    };
}

// Combines dim and validator to get the required function.
function getdim(mat) {
    var d = dim(mat);
    return validator(d)(mat) ? d : false;
}

// Checks whether predicate applies to every element of array arr.
// This ought to be built into JS some day!
function every(arr, predicate) {
    var i, N;
    for (i = 0, N = arr.length; i < N; ++i) {
        if (!predicate(arr[i])) {
            return false;
        }
    }

    return true;
}
