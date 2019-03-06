import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Labels } from './Labels.js';
import { Proposals } from '../proposals/Proposals.js';
import { convertToSlug } from '../../utils/functions';

Meteor.methods({
    addLabel: function (label) {
      check(label, {
        keyword: String,
        description: String,
        //level: Number,
        communityId: String,
        parentLabels: Match.Maybe([String])
      });
      //parentLabels:
      var existingLabel = Labels.findOne({keyword: label.keyword, communityId: label.communityId});
      if (!existingLabel){
        let newLabel = Labels.insert({ keyword: label.keyword, description: label.description, communityId: label.communityId, parentLabels: checkParents(label) });
        return newLabel;
      } else {
        return existingLabel._id;
      }
    },
    editLabel: function (label) {
      check(label, {
        id: String,
        keyword: String,
        description: String,
        //level: Number,
        communityId: String,
        parentLabels: Match.Maybe([String])
      });
      Labels.update({"_id":label.id},{$set:{ "keyword": label.keyword,"description":label.description,"parentLabels":checkParents(label)}});
      return label.id;
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
      /* UPDATE THIS TO STRIP LABEL FROM EXISTING PROPOSALS AND USER PROFILES
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
      */
      //kill label
      let children = Labels.find({parentLabels: labelId});
      children.forEach(function (value) {
        Labels.update({"_id":value._id},{$pull: {"parentLabels": labelId}});
      });
      //remove all children;
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

//checks to see if the
function checkParents(label){
  let parents = label.parentLabels;
  if(Array.isArray(parents)){
    for (var i in parents) {
      console.log(parents);
      console.log("parents[i]:" + parents[i] + ",label.id: " + label.id);
      if(parents[i]===label.id){
        parents.splice(i,1);
      }
    }
  }
  return parents;
}
