import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Proposals } from '../proposals/Proposals.js'
import { DelegateVotes } from './DelegateVotes.js'

Meteor.methods({
  voteAsDelegate: function(voteData) {
    var delegate = Meteor.user();
    var proposal = Proposals.findOne(voteData.proposalId);
    // ensure the user is logged in
    if (!delegate)
      throw new Meteor.Error(401, "You need to login to vote");
    if (!voteData.vote)
      throw new Meteor.Error(422, 'Please vote yes or no');
    if (!proposal)
      throw new Meteor.Error(422, 'You must vote on a proposal');
    if (!Roles.UserIsInRole, delegate._id, 'delegate')
      throw new Meteor.Error(422, 'You must be a delegate to vote as one.');
    vote = {
      vote: voteData.vote,
      proposalId: voteData.proposalId,
      delegateId: voteData.delegateId,
      delegateId: delegate._id
    }

    return DelegateVotes.insert(vote);
  },
  deleteDelegateVote: function(voteId) {
    DelegateVotes.remove(voteId);
  },
  getDelegateVote: function(voteId){
    return DelegateVotes.findOne({_id: voteId});
  },
  getDelegateVoteFor: function(proposalId, delegateId){
    return DelegateVotes.findOne({proposalId: proposalId, delegateId: delegateId});
  }
});