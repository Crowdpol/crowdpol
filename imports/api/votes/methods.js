import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Proposals } from '../proposals/Proposals.js'
import { Votes } from './Votes.js';
import CryptoJS from 'crypto-js';

Meteor.methods({
  vote: function(voteData) {
    check(voteData, {vote: String, proposalId: String, delegateId: Match.Maybe(String)});
    var user = Meteor.user();
    var proposal = Proposals.findOne(voteData.proposalId);
    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to vote");
    if (!voteData.vote)
      throw new Meteor.Error(422, 'Please vote yes, no or abstain');
    if (!proposal)
      throw new Meteor.Error(422, 'You must vote on a proposal');

    var salt = user.username;
    var voterHash = CryptoJS.SHA256(user._id + salt).toString(CryptoJS.enc.SHA256);

    vote = {
        vote: voteData.vote,
        proposalId: voteData.proposalId,
        delegateId: voteData.delegateId,
        voterHash: voterHash
      }
    console.log(Meteor.userId());
    console.log(vote);
    //if the user has already voted for that proposal, update their vote
    var existingVote = Votes.findOne({proposalId: vote.proposalId, voterHash: voterHash});
    if (existingVote){
      Votes.update({_id: existingVote._id}, {$set: vote});
    } else {
      //else create a new vote
      return Votes.insert(vote);
    }
  },
  deleteVote: function(voteData) {
    //console.log(voteData);

    check(voteData, { vote: String, proposalId: String});
    let userId = Meteor.userId();
    var salt = Meteor.users.findOne({_id: userId}).username;
    var voterHash = CryptoJS.SHA256(userId + salt).toString(CryptoJS.enc.SHA256);
    if(userId){
      Votes.remove({"proposalId" :voteData.proposalId,"voterHash":voterHash,"vote":voteData.vote});
    }
  },
  getVote: function(voteId){
    check(voteId, String);
    return Votes.findOne({_id: voteId});
  },
  getUserVoteFor: function(proposalId, userId){
    check(proposalId, String);
    check(userId, String);
    var salt = Meteor.users.findOne({_id: userId}).username;
    var voterHash = CryptoJS.SHA256(userId + salt).toString(CryptoJS.enc.SHA256);
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
            },
            "abstainCount": {
                "$sum": {
                    $cond: [ { $eq: [ "$vote", "abstain" ] }, 1, 0 ]
                }
            }
        }},
    ]);
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
