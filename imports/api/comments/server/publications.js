import { Meteor } from 'meteor/meteor';
import { Comments } from '../Comments.js';

Meteor.publish('comments', function(proposalId) {
  return Comments.find({proposalId: proposalId});
});
Meteor.publish('comments.all', function() {
  return Comments.find();
});

