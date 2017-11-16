import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Tags } from './Tags.js';
import { convertToSlug } from '../../utils/functions';

Meteor.methods({
    addTag: function (text) {
      var existingTag = Tags.findOne({keyword: convertToSlug(text)});
      if (!existingTag){
        return Tags.insert({ text: text });
      } else {
        return false;
      }
    },
    getTag: function (tagID) {
      //console.log("method getTag called");
      return Tags.findOne({_id: tagID});
    },
    getTagByKeyword: function(keyword){
      return Tags.findOne({keyword: keyword});
    },
    deleteTag: function (tagID) {
      //console.log("method deleteTag called");
      Tags.remove(tagID);
    },
    toggleAuthorized: function (tagID,value) {
      //console.log("method deleteTag called");
      check(tagID, String);
      check(value, Boolean);
      var tag = Tags.findOne({_id: tagID});
      Tags.update({_id: tagID}, {$set: {"authorized": value}});
    }
});