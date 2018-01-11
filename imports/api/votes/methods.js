import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Proposals } from '../proposals/Proposals.js'
import { Votes } from './Votes.js'

Meteor.methods({
  vote: function(voteData) {
    check(voteData, {vote: String, proposalId: String, delegateId: Match.Maybe(String)});
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

    //if the user has already voted for that proposal, update their vote
    var existingVote = Votes.findOne({proposalId: vote.proposalId, voterHash: vote.voterHash});
    if (existingVote){
      Votes.update({_id: existingVote._id}, {$set: vote});
    } else {
      //else create a new vote
      return Votes.insert(vote);
    }
  },
  deleteVote: function(voteId) {
    check(voteId, String);
    Votes.remove(voteId);
  },
  getVote: function(voteId){
    check(voteId, String);
    return Votes.findOne({_id: voteId});
  },
  getUserVoteFor: function(proposalId, voterHash){
    check(proposalId, String);
    check(voterHash, String);
    return Votes.findOne({proposalId: proposalId, voterHash: voterHash});
  },
  getProposalIndividualVotes: function(proposalId){
    check(proposalId, String);
    results = Votes.aggregate([
      { $match: {"proposalId" : proposalId}},
      { $group: {
            "_id": "$proposalId",
            "yesCount": {
                "$sum": {
                    $cond: [ { $eq: [ "$vote", "yes" ] }, 1, 0 ]
                }
            },
            "noCount": {
                "$sum": {
                    $cond: [ { $eq: [ "$vote", "no" ] }, 1, 0 ]
                }
            }
        }},
    ]);
    //console.log(results);
    return results;
  },
});

/* MONGO QUERIES IN USE:
GET TOTAL INDIVIDUAL VOTES FOR ALL PROPOSALS
db.votes.aggregate([
  { $group: {
        "_id": "$proposalId",
        "yesCount": {
            "$sum": {
                $cond: [ { $eq: [ "$vote", "yes" ] }, 1, 0 ]
            }
        },
        "noCount": {
            "$sum": {
                $cond: [ { $eq: [ "$vote", "no" ] }, 1, 0 ]
            }
        }
    }},
]);
GET ALL DELEGATE VOTES FOR SINGLE PROPOSAL
db.votes.aggregate([
  { $match: {"proposalId" : "GqXEii9qmfJ7vai6K"}},
  { $group: {
        "_id": "$proposalId",
        "yesCount": {
            "$sum": {
                $cond: [ { $eq: [ "$vote", "yes" ] }, 1, 0 ]
            }
        },
        "noCount": {
            "$sum": {
                $cond: [ { $eq: [ "$vote", "no" ] }, 1, 0 ]
            }
        }
    }},
]);
*/