import { Meteor } from 'meteor/meteor';
import { DelegateVotes } from '../DelegateVotes.js';
import { Ranks } from '../../ranking/Ranks.js';

Meteor.publish('delegateVotes.forProposal', function(proposalId) {
	return DelegateVotes.find({proposalId: proposalId});
});

Meteor.publish('delegateVotes.forDelegate', function(delegateId) {
	return DelegateVotes.find({delegateId: delegateId});
});

Meteor.publish('delegateVotes.currentUser', function(proposalId) {
	return DelegateVotes.find({delegateId: Meteor.userId()});
});

Meteor.publish('delegateVotes.forUserProposal', function(proposalId) {
	//STEP 1: Get id of highest ranked delegate for current user
	let delegate = highestRankedDelegate(proposalId);
	//STEP 2: Get the delegate vote of the highest ranked delegate for user
	return DelegateVotes.find({delegateId: delegate.id});
});

function highestRankedDelegate(proposalId){
	//get all delegates sorted by rank desc
	let highestRank = Ranks.find({"supporterId":Meteor.userId()},{sort:{"ranking":-1}});
	let delegate = {id:false,ranking:false};
	//loop through ranks and check if delegate has voted, last match gets returned.
	highestRank.forEach(function(item){
		if(typeof item.entityId !== undefined){
			let delegateVoteCount = DelegateVotes.find({delegateId: item.entityId,proposalId:proposalId}).count()
			if(delegateVoteCount>0){
				//delegateId = item.entityId;
				delegate.id = item.entityId;
				delegate.ranking = item.ranking;
			}
		}
	});
	return delegate;
}

function addRanking(delegateVot){
	console.loog(delegateVote);
	return delegateVote;
}
