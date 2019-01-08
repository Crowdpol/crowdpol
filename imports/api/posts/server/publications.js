import { Meteor } from 'meteor/meteor';
import { Posts } from '../Posts.js';

Meteor.publish('posts', function(userId) {
  return Posts.find({userId: userId});
});
