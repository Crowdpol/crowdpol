import { Meteor } from 'meteor/meteor';
import { Proposals } from '../Proposals.js';

Meteor.publish('proposals.all', function() {
  return Proposals.find();
});

Meteor.publish('proposals.one', function(id) {
  return Proposals.find({_id: id});
});

Meteor.publish('proposals.open', function() {
	return Proposals.find({endDate:{"$lte": new Date()}, stage: 'live'});
});

Meteor.publish('proposals.closed', function() {
	return Proposals.find({endDate:{"$gte": new Date()}, stage: 'live'});
});

Meteor.publish('proposals.author', function(authorId) {
  return Proposals.find({authorId: authorId});
});

Meteor.publish('proposals.invited', function() {
  return Proposals.find();
});