import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Maps } from './Maps.js';

Meteor.methods({
    addMap: function (type,url,geojson,communityId) {
      check(keyword, String);
      check(url, String);
      check(geojson, String);
      check(communityId, String);

      var existingMap = Maps.findOne({communityId:communityId});
      if (!existingMap){
        let map = Maps.insert({communityId:communityId});
        return map;
      } else {
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
    }
});
