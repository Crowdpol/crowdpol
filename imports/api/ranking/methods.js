import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Ranks } from './Ranks.js';

Meteor.methods({
    addRank: function (entityType,entityId,ranking) {
      //console.log("method addRank called");
      check(entityType, String);
      check(entityId, String);
      check(ranking, Number);
      Ranks.insert({ entityType: entityType, entityId: entityId, supporterId: Meteor.userId(), ranking: ranking});
      return Meteor.call('getRanks',Meteor.userId(),entityType);
    },
    removeRank: function (entityType,entityId) {
      check(entityType, String);
      check(entityId, String);
      Ranks.remove({ entityType: entityType, entityId: entityId, supporterId: Meteor.userId()});
      return Meteor.call('getRanks',Meteor.userId(),entityType);
    },
    getRank: function (rankID) {
      check(rankID, String);
      //console.log("method getRank called");
      return Ranks.findOne({_id: rankID});
    },
    deleteRank: function (rankID) {
      check(rankID, String);
      Ranks.remove(rankID);
    },
    getRanks: function(userId, type) {
      check(userId, String);
      check(type, String);
      //console.log("getRank: userId: " + userId + " type: " + type);
      results = Ranks.aggregate([
        { $match: {"supporterId" : userId,"entityType" : type}},
        {$project:{"_id": 0,"entityId" :1}}
      ]).map(function(el) { return el.entityId });
      return results;
    },
    updateRanks: function(rankings,type){
      check(rankings, [String]);
      check(type, String);
      var rank = 1;
      rankings.forEach(function(entry) {
        currentRanking = Ranks.findOne({entityType: type, entityId: entry, supporterId: Meteor.userId()});
        result = Ranks.update({_id: currentRanking._id},{$set: {"ranking": rank}});
        rank+=1;
      });
    },
    removeRanks: function(entityType,entityId){
      check(entityType, String);
      check(entityId, String);
      Ranks.remove({ entityType: entityType, entityId: entityId});
    }
});
