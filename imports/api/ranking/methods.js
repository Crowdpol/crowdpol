import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Ranks } from './Ranks.js';

Meteor.methods({
    addRank: function (entityType,entityId,ranking,communityId) {
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
      //console.log("rank removed");
      reorderRanks(Meteor.userId());
      return Meteor.call('getRanks',Meteor.userId(),entityType,communityId);
    },
    getRank: function (rankID) {
      check(rankID, String);
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
      results = Ranks.aggregate([
        { $match: {"supporterId" : userId,"entityType" : type,"communityId":communityId}},
        {$sort: {"ranking": 1}},
        {$project:{"_id": 0,"entityId" :1}}
      ]).map(function(el) { return el.entityId });
      console.log("dumping: getRanks " + communityId);
      console.log(results)
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

function reorderRanks(supporterId){
  let userRanks = Ranks.find({"supporterId":supporterId},{sort:{"ranking":1,"lastUpdate":1}});
  var rank = 1;
  userRanks.forEach(function(ranking) {
    if(ranking){
      if(typeof ranking._id != 'undefined'){
        Ranks.update({_id: ranking._id},{$set: {"ranking": rank}});
        rank+=1;
      }
    }
  });
}
