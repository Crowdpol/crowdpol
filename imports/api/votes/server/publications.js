import { Meteor } from 'meteor/meteor';
import { Votes } from '../Votes.js';

Meteor.publish('votes.forProposal', function(proposalId) {
	return Votes.find({proposalId: proposalId});
});

Meteor.publish('votes.forUser', function(userId) {
	return Votes.find({voterHash: userId});
});

