import { Meteor } from 'meteor/meteor';
import { Proposals } from '../Proposals.js';

Meteor.publish('proposals.all', function() {
  return Proposals.find();
});

Meteor.publish('proposals.one', function(id) {
  return Proposals.find({_id: id});
});