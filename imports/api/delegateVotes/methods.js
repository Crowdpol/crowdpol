import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Proposals } from '../proposals/Proposals.js'
import { DelegateVotes } from './DelegateVotes.js'

Meteor.methods({
  voteAsDelegate: function(voteData) {
    check(voteData, { vote: String, proposalId: String, reason: Match.Maybe(String)});
    var delegate = Meteor.user();
    var proposal = Proposals.findOne(voteData.proposalId);
    // ensure the user is logged in
    if (!delegate)
      throw new Meteor.Error(401, "You need to login to vote");
    if (!voteData.vote)
      throw new Meteor.Error(422, 'Please vote yes or no');
    if (!proposal)
      throw new Meteor.Error(422, 'You must vote on a proposal');
    if (!Roles.userIsInRole(delegate._id, 'delegate'))
      throw new Meteor.Error(422, 'You must be a delegate to vote as one.');
    vote = {
      vote: voteData.vote,
      proposalId: voteData.proposalId,
      reason: voteData.reason,
      delegateId: delegate._id
    }

    return DelegateVotes.insert(vote);
  },
  deleteDelegateVote: function(voteId) {
    check(voteId, String);
    DelegateVotes.remove(voteId);
  },
  getDelegateVote: function(voteId){
    check(voteId, String);
    return DelegateVotes.findOne({_id: voteId});
  },
  getDelegateVoteFor: function(proposalId, delegateId){
    check(proposalId, String);
    check(delegateId, String);
    return DelegateVotes.findOne({proposalId: proposalId, delegateId: delegateId});
  },
  getUserDelegateVote: function(proposalId){
    /* Returns null if the user has already voted, else returns the vote of the 
    current user's first-ranked delegate*/
    var userVote = Meteor.call('getUserVoteFor', proposalId, Meteor.userId());

    if (!userVote){
      var rankedDelegates = Meteor.call('getDelegateVotes');
      var voteInfo = rankedDelegates[0].vote_info[0]
      if (voteInfo) {
        return voteInfo.vote
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
});