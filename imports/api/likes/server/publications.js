import { Meteor } from 'meteor/meteor';
import { Likes } from '../Likes.js';

Meteor.publish('likes.all', function() {
  return Likes.find();
});

Meteor.publish('likes', function(objectId) {
  return Likes.find({objectId: objectId});
});
