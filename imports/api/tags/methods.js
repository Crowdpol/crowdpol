import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Tags } from './Tags.js';
import { convertToSlug } from '../../utils/functions';

Meteor.methods({
    addTag: function (keyword, communityId) {
      console.log("tag is being added!");
      check(keyword, String);
      check(communityId, String);
      console.log("Add tag Methogd, keyword: " + keyword + ", communityId: " + communityId);
      var existingTag = Tags.findOne({keyword: convertToSlug(keyword), communityId: communityId});
      if (!existingTag){
        let tag = Tags.insert({ keyword: keyword, communityId: communityId });
        console.log(tag);
        return tag;
      } else {
        console.log("return false");
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
    deleteTag: function (tagID) {
      check(tagID, String);
      Tags.remove(tagID);
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
      console.log("transformTags: " + keywords + " " + communityId);
      for (i=0; i<keywords.length; i++){
        console.log(keywords[i]);
        var tag = Meteor.call('addTag',keywords[i],communityId);
        console.log('logging return from addTag: ');
        console.log(tag);
        // If a tag doesn't exist yet, create a new one
        if (tag) {
          tags.push(tag);
        }
      }
      console.log(tags);
      return tags;

    }
});
