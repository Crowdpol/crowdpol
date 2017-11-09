import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Ranks } from './Ranks.js';

Meteor.methods({
    addRank: function (entityType,entityId,supporterId,ranking) {
      console.log("method addRank called");
      check(entityType, String);
      check(entityId, String);
      check(supporterId, String);
      check(ranking, Number);
      return Ranks.insert({ entityType: entityType, entityId: entityId, supporterId: supporterId, ranking: ranking});
    },
    getRank: function (rankID) {
      console.log("method getRank called");
      return Ranks.findOne({_id: rankID});
    },
    deleteRank: function (rankID) {
      console.log("method deleteRank called");
      Ranks.remove(rankID);
    },
});