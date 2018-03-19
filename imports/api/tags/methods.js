import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Tags } from './Tags.js';
import { convertToSlug } from '../../utils/functions';

Meteor.methods({
    addTag: function (keyword, communityId) {
      check(keyword, String);
      check(communityId, String);
      var existingTag = Tags.findOne({keyword: convertToSlug(keyword), communityId: communityId});
      if (!existingTag){
        return Tags.insert({ keyword: keyword, communityId: communityId });
      } else {
        return false;
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
      for (i=0; i<keywords.length; i++){
        var tag = Tags.findOne({keyword: keywords[i]});
        // If a tag doesn't exist yet, create a new one 
        if (!tag) {
          var id = Tags.insert({ keyword: keywords[i], communityId: communityId });
          tag = Tags.findOne({_id: id})
        }
        tags.push({keyword: tag.keyword, url: tag.url, _id: tag._id})
      }

      return tags;

    }
});