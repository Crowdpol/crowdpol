import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Tags } from './Tags.js';
import { Proposals } from '../proposals/Proposals.js';
import { convertToSlug } from '../../utils/functions';

Meteor.methods({
    addTag: function (keyword, communityId) {
      check(keyword, String);
      check(communityId, String);
      var existingTag = Tags.findOne({keyword: convertToSlug(keyword), communityId: communityId});
      if (!existingTag){
        let tag = Tags.insert({ keyword: keyword, communityId: communityId });
        return tag;
      } else {
        return existingTag._id;
      }
    },
    getTag: function (tagID) {
      check(tagID, String);
      return Tags.findOne({_id: tagID});
    },
    getTagByKeyword: function(keyword, communityId){
      check(keyword, String);
      //check(communityId, String);
      return Tags.findOne({keyword: keyword, communityId: communityId});
    },
    deleteTag: function (tagId) {
      check(tagId, String);
      //pull tag id from any proposals
      let proposals = Proposals.find({tags: tagId});
      proposals.forEach(function (value) {
        Proposals.update({"_id":value._id},{$pull: {tags: tagId}})
      });
      //pull tag id from any user profiles
      let users = Meteor.users.find({"profile.tags":tagId});
      users.forEach(function (value) {
        Meteor.users.update({"_id":value._id},{$pull: {"profile.tags": tagId}});
      });
      //kill tag
      return Tags.remove(tagId);
    },
    toggleAuthorized: function (tagID,value) {
      check(tagID, String);
      check(value, Boolean);
      var tag = Tags.findOne({_id: tagID});
      Tags.update({_id: tagID}, {$set: {"authorized": value}});
    },
    transformTags: function(keywords, communityId){
      /*Takes an array of tag keywords and communityId and returns an array of tag objects
      to store on user profiles or proposals*/
      check(keywords, [String]);
      check(communityId, String);
      var tags = []
      for (i=0; i<keywords.length; i++){
        var tag = Meteor.call('addTag',keywords[i],communityId);
        // If a tag doesn't exist yet, create a new one
        if (tag) {
          tags.push(tag);
        }
      }
      return tags;

    }
});
