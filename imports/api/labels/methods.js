import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Labels } from './Labels.js';
import { Proposals } from '../proposals/Proposals.js';
import { convertToSlug } from '../../utils/functions';

Meteor.methods({
    addLabel: function (keyword, communityId) {
      check(keyword, String);
      check(communityId, String);
      var existingLabel = Labels.findOne({keyword: convertToSlug(keyword), communityId: communityId});
      if (!existingLabel){
        let label = Labels.insert({ keyword: keyword, communityId: communityId });
        return label;
      } else {
        return existingLabel._id;
      }
    },
    getLabel: function (labelID) {
      check(labelID, String);
      return Labels.findOne({_id: labelID});
    },
    getLabelByKeyword: function(keyword, communityId){
      check(keyword, String);
      //check(communityId, String);
      return Labels.findOne({keyword: keyword, communityId: communityId});
    },
    deleteLabel: function (labelId) {
      check(labelId, String);
      //pull label id from any proposals
      let proposals = Proposals.find({labels: labelId});
      proposals.forEach(function (value) {
        Proposals.update({"_id":value._id},{$pull: {labels: labelId}})
      });
      //pull label id from any user profiles
      let users = Meteor.users.find({"profile.labels":labelId});
      users.forEach(function (value) {
        Meteor.users.update({"_id":value._id},{$pull: {"profile.labels": labelId}});
      });
      //kill label
      return Labels.remove(labelId);
    },
    transformLabels: function(keywords, communityId){
      /*Takes an array of label keywords and communityId and returns an array of label objects
      to store on user profiles or proposals*/
      check(keywords, [String]);
      check(communityId, String);
      var labels = []
      for (i=0; i<keywords.length; i++){
        var label = Meteor.call('addLabel',keywords[i],communityId);
        // If a label doesn't exist yet, create a new one
        if (label) {
          labels.push(label);
        }
      }
      return labels;

    }
});
