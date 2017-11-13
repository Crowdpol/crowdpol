import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Ranks } from './Ranks.js';

Meteor.methods({
    addRank: function (entityType,entityId,ranking) {
      console.log("method addRank called");
      check(entityType, String);
      check(entityId, String);
      check(ranking, Number);
      Ranks.insert({ entityType: entityType, entityId: entityId, supporterId: Meteor.userId(), ranking: ranking});
      return Meteor.call('getRanks',Meteor.userId(),entityType);
    },
    removeRank: function (entityType,entityId) {
      console.log("method addRank called");
      check(entityType, String);
      check(entityId, String);
      Ranks.remove({ entityType: entityType, entityId: entityId, supporterId: Meteor.userId()});
      return Meteor.call('getRanks',Meteor.userId(),entityType);
    },
    getRank: function (rankID) {
      console.log("method getRank called");
      return Ranks.findOne({_id: rankID});
    },
    deleteRank: function (rankID) {
      console.log("method deleteRank called");
      Ranks.remove(rankID);
    },
    getRanks: function(userId, type) {
      check(userId, String);
      check(type, String);
      console.log("getRank: userId: " + userId + " type: " + type);
      results = Ranks.aggregate([
        { $match: {"supporterId" : userId,"entityType" : type}},
        {$project:{"_id": 0,"entityId" :1}}
      ]).map(function(el) { return el.entityId });
      console.log(results);
      //Session.set("ranks",results);
      return results;
    }
});