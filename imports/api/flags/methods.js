import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Flags } from './Flags.js';
import { convertToSlug } from '../../utils/functions';

Meteor.methods({
    addTag: function (keyword, communityId) {
      check(keyword, String);
      check(communityId, String);
      var existingTag = Flags.findOne({keyword: convertToSlug(keyword), communityId: communityId});
      if (!existingTag){
        return Flags.insert({ keyword: keyword, communityId: communityId });
      } else {
        return false;
      }
    },
    getTag: function (flagID) {
      check(flagID, String);
      return Flags.findOne({_id: flagID});
    },
    getTagByKeyword: function(keyword, communityId){
      check(keyword, String);
      //check(communityId, String);
      return Flags.findOne({keyword: keyword, communityId: communityId});
    },
    deleteTag: function (flagID) {
      check(flagID, String);
      Flags.remove(flagID);
    },
    toggleAuthorized: function (flagID,value) {
      check(flagID, String);
      check(value, Boolean);
      var flag = Flags.findOne({_id: flagID});
      Flags.update({_id: flagID}, {$set: {"authorized": value}});
    },
    transformFlags: function(keywords, communityId){
      /*Takes an array of tag keywords and communityId and returns an array of flag objects 
      to store on user profiles or proposals*/
      check(keywords, [String]);
      check(communityId, String);
      var flags = []
      for (i=0; i<keywords.length; i++){
        var flag = Flags.findOne({keyword: keywords[i]});
        // If a tag doesn't exist yet, create a new one 
        if (!flag) {
          var id = Flags.insert({ keyword: keywords[i], communityId: communityId });
          flag = Flags.findOne({_id: id})
        }
        flags.push({keyword: flag.keyword, url: flag.url, _id: flag._id})
      }

      return flags;

    }
});