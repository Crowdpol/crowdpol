import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Tags } from './Tags.js';

Meteor.methods({
    addTag: function (text) {
      //console.log("method addTag called");
      check(text, String);
      return Tags.insert({ text: text });
    },
    getTag: function (tagID) {
      //console.log("method getTag called");
      return Tags.findOne({_id: tagID});
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