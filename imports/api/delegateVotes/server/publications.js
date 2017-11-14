import { Meteor } from 'meteor/meteor';
import { DelegateVotes } from '../DelegateVotes.js';

Meteor.publish('delegateVotes.forProposal', function(proposalId) {
	return DelegateVotes.find({proposalId: proposalId});
});

Meteor.publish('delegateVotes.forDelegate', function(delegateId) {
	return DelegateVotes.find({delegateId: delegateId});
});

