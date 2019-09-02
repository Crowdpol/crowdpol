import { Meteor } from 'meteor/meteor';
import { Votes } from '../Votes.js';
import CryptoJS from 'crypto-js';

Meteor.publish('votes.all', function() {
	console.log("publish votes.all");
	return Votes.find();
});

Meteor.publish('votes.forProposal', function(proposalId) {
	console.log("publish votes.forProposal");
	return Votes.find({proposalId: proposalId});
});

Meteor.publish('votes.forUser', function(userId) {
	console.log("publish votes.forUser");
	return Votes.find({voterHash: userId});
});

Meteor.publish('votes.forProposalCurrentUser', function(proposalId) {
	//console.log("publish votes.forCurrentUser");
	let user = Meteor.users.findOne({_id: Meteor.userId()});
	if(user){
		if(typeof user.username){
			var salt = user.username;
			var voterHash = CryptoJS.SHA256(Meteor.userId() + salt).toString(CryptoJS.enc.SHA256);
			//console.log("userId: " + Meteor.userId() + ", salt: " + salt + ", voterHash: " + voterHash);
			return Votes.find({voterHash: voterHash,proposalId:proposalId});
		}
	}
});
