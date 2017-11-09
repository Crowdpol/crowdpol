import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Proposals } from '../proposals/Proposals.js'
import { Votes } from './Votes.js'

Meteor.methods({
  vote: function(voteData) {
    var user = Meteor.user();
    var proposal = Proposals.findOne(voteData.proposalId);
    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to vote");
    if (!voteData.vote)
      throw new Meteor.Error(422, 'Please vote yes or no');
    if (!proposal)
      throw new Meteor.Error(422, 'You must vote on a proposal');
    vote = {
      vote: voteData.vote,
      proposalId: voteData.proposalId,
      delegateId: voteData.delegateId,
      voterHash: user._id
    }
    return Votes.insert(vote);
  },
  deleteVote: function(voteId) {
    Votes.remove(voteId);
  },
  getVote: function(voteId){
    return Votes.findOne({_id: voteId});
  }
});