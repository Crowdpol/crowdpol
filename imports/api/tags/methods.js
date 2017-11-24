import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Tags } from './Tags.js';
import { convertToSlug } from '../../utils/functions';

Meteor.methods({
    addTag: function (text) {
      check(text, String);
      var existingTag = Tags.findOne({keyword: convertToSlug(text)});
      if (!existingTag){
        return Tags.insert({ text: text });
      } else {
        return false;
      }
    },
    getTag: function (tagID) {
      check(tagID, String);
      return Tags.findOne({_id: tagID});
    },
    getTagByKeyword: function(keyword){
      check(keyword, String);
      return Tags.findOne({keyword: keyword});
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
    transformTags: function(tagsText){
      /*Takes an array of tag text and returns an array of tag objects 
      to store on user profiles or proposals*/
      check(tagsText, [String]);
      var tags = []
      for (i=0; i<tagsText.length; i++){
        var tag = Tags.findOne({text: tagsText[i]});
        // If a tag doesn't exist yet, create a new one 
        if (!tag) {
          var id = Tags.insert({ text: tagsText[i] });
          tag = Tags.findOne({_id: id})
        }
        tags.push({text: tag.text, keyword: tag.keyword, url: tag.url, _id: tag._id})
      }

      return tags;

    }
});