import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Ranks } from './Ranks.js';

Meteor.methods({
    addRank: function (entityType,entityId,ranking,communityId) {
      //console.log(communityId);
      check(entityType, String);
      check(entityId, String);
      check(ranking, Number);
      check(communityId, String);
      Ranks.insert({ entityType: entityType, entityId: entityId, supporterId: Meteor.userId(), ranking: ranking, communityId: communityId});
      return Meteor.call('getRanks',Meteor.userId(),entityType,communityId);
    },
    removeRank: function (entityType,entityId,communityId) {
      check(entityType, String);
      check(entityId, String);
      check(communityId, String);
      Ranks.remove({ entityType: entityType, entityId: entityId, supporterId: Meteor.userId()});
      return Meteor.call('getRanks',Meteor.userId(),entityType,communityId);
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
    getRanks: function(userId, type,communityId) {
      check(userId, String);
      check(type, String);
      check(communityId, String);
      //console.log("getRank: userId: " + userId + " type: " + type + " communityId:" + communityId);
      results = Ranks.aggregate([
        { $match: {"supporterId" : userId,"entityType" : type,"communityId":communityId}},
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
    removeRanks: function(entityType,entityId,communityId){
      check(entityType, String);
      check(entityId, String);
      check(communityId, String);
      Ranks.remove({ entityType: entityType, entityId: entityId, communityId: communityId});
    }
});
