import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Maps } from './Maps.js';

Meteor.methods({
    addMap: function (map) {
      console.log(map);
      check(map, {
        type: String,
        properties: {
          name: Match.Maybe(String),
          key: Match.Maybe(String),
          rootMap: Match.Maybe(String),
          communityId: Match.Maybe(String),
          rootCommunityId: Match.Maybe(String)
        },
        //geometry: Object
        geometry :{
          type: Match.Maybe(String),
          coordinates: Match.Maybe([Match.Any]),
          multiCoordinates: Match.Maybe([Match.Any]),
        }
      });
      let coordinates = map.geometry.coordinates;
      let multidimensionArray = true;
      if(Array.isArray(coordinates)){
        coordinates.forEach(function (item, index) {
          if(!Array.isArray(item)){
            multidimensionArray = false;
          }
        });
      }else{
        multidimensionArray = false
      }
      //console.log("multidimensionArray: " + multidimensionArray);
      var existingMap = Maps.findOne({key:map.properties.key});
      console.log(existingMap);
      if (!existingMap){
        let newMap = Maps.insert(map);
        console.log("newMap added");
        return newMap;
      } else {
        console.log("existingMap found");
        return existingMap._id;
      }
    },
    getMap: function (mapID) {
      check(mapID, String);
      return Maps.findOne({_id: mapID});
    },
    deleteMap: function (mapId) {
      check(mapId, String);
      //kill map
      return Maps.remove(mapId);
    },
    getRootCommunityGeoJson: function (communityId){
      check(communityId, String);
      let maps = Maps.find({"rootCommunityId":communityId}).fetch();
      /*
      _.each(maps, function(map){
        console.log(map);
      });*/
      let geoJSON = {};
      if(maps.length){
        console.log("maps.length: " + maps.length);
        let geoJSON = {
          "type": "FeatureCollection",
          "features": maps
        }
      }else{
        console.log("maps query is of 0 length");
      }
      return geoJSON;
    }
});
