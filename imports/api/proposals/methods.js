import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Proposals } from './Proposals.js';
import { Votes } from '../votes/Votes.js';
import { Ranks } from '../ranking/Ranks.js';

Meteor.methods({
  createProposal: function (proposal) {
      //try{
        check(proposal, { 
          content: Match.Maybe([Object]),
          startDate: Date, 
          endDate: Date, 
          authorId: String,
          invited: Match.Maybe([String]),
          tags: Match.Maybe([Object]),
          references: Match.Maybe([String]),
          communityId: String
        });
        proposalId = Proposals.insert(proposal);
        //Create notifications for collaborators
        if (proposal.invited) {
          for (i=0; i < proposal.invited.length; i++) {
            var notification = {
              message: TAPi18n.__('notifications.proposals.invite'), 
              userId: proposal.invited[i], 
              url: '/proposals/view/' + proposalId, 
              icon: 'people'
            }
            Meteor.call('createNotification', notification);
          }
        }
        return proposalId;
      //} catch (err) {
        //console.log(err);
        //return err;
      //}
    },
    getProposal: function (proposalId) {
      check(proposalId, String);
      return Proposals.findOne({_id: proposalId});
    },
    deleteProposal: function(proposalId) {
      check(proposalId, String);
      var user = Meteor.user();

      var proposal = Proposals.findOne(proposalId);
      // user must be logged in
      if (!user)
        throw new Meteor.Error(401, "You need to login to delete your proposal.");
      // proposal must exist
      if (!proposal)
        throw new Meteor.Error(422, "Proposal does not exist.");
      // user must be the author of the proposal
      if (!proposal.authorId == Meteor.userId())
        throw new Meteor.Error(422, "Only the author of a proposal can delete it.");
      
      Proposals.remove(proposalId);
      
    },
    rejectProposal: function (proposalId) {
      check(proposalId, String);
      var userId = Proposals.findOne(proposalId).authorId;
      Proposals.update({_id: proposalId}, {$set: {"status": "rejected"}});
      var message = TAPi18n.__('notifications.proposals.rejected');
      var url = '/proposals/view/' + proposalId;
      Meteor.call('createNotification', {message: message, userId: userId, url: url, icon: 'do_not_disturb'})
    },
    approveProposal: function(proposalId){
      check(proposalId, String);
      var userId = Proposals.findOne(proposalId).authorId;
      Proposals.update({_id: proposalId}, {$set: {"stage": "live"}});
      Proposals.update({_id: proposalId}, {$set: {"status": "approved"}});
      /* This should be removed after September 2018: 
      Voting opens from the day the proposal is approved.
      Eventually custom dates should be set by the author.
      */
      //Proposals.update({_id: proposalId}, {$set: {"startDate": new Date()}});

      // Create notification
      var message = TAPi18n.__('notifications.proposals.approved');
      var url = '/proposals/view/' + proposalId;
      Meteor.call('createNotification', {message: message, userId: userId, url: url, icon: 'check'});
    },
    updateProposalStage: function(proposalId, stage){
      check(proposalId, String);
      check(stage, String);
      Proposals.update({_id: proposalId}, {$set: {"stage": stage}});
    },
    saveProposalChanges: function (proposalId, proposal) {
      check(proposalId, String);
      // Find if new collaborators have been added
      var oldInvites = Proposals.findOne(proposalId).invited;
      var newInvites = proposal.invited;

      if (oldInvites && newInvites) {
        // Only send new invites if new collaborators have been added
        var newCollaborators = _.difference(newInvites, oldInvites);
        if (newCollaborators) {
          // Create notification for each new collaborator
          for (i=0; i<newCollaborators.length; i++) {
            var notification = {
              message: TAPi18n.__('notifications.proposals.invite'), 
              userId: newCollaborators[i], 
              url: '/proposals/view/' + proposalId, 
              icon: 'people'
            }
            Meteor.call('createNotification', notification);
          }
        } 
      }

      Proposals.update({_id: proposalId}, {$set: proposal });
    },
    addTagToProposal: function(proposalId, tag) {
      check(proposalId, String);
      check(tag, { 
        keyword: String, 
        url: String, 
        _id: String });
      Proposals.update({_id: proposalId}, {$push: {tags: tag} });
    },
    removeTagFromProposal: function(proposalId, tag) {
      check(proposalId, String);
      check(tag, { 
        keyword: String, 
        url: String, 
        _id: String });
      Proposals.update({_id: proposalId}, {$pull: {tags: tag} });
    },
    toggleSignProposal: function(proposalId) {
      check(proposalId, String);
      var user = Meteor.user();
      var proposal = Proposals.findOne(proposalId);
      // ensure the user is logged in
      if (!user)
        throw new Meteor.Error(401, "You need to login to sign a proposal");
      if (!proposal)
        throw new Meteor.Error(422, 'You must sign a proposal');

      //If already signed, unsign
      var userHasSigned = false;
      if (proposal.signatures){
        if (proposal.signatures.includes(Meteor.userId())){
          userHasSigned = true;
        }
      }
      if (userHasSigned){
        return Proposals.update({_id: proposalId}, {$pull: {signatures: Meteor.userId()}});
      } else {
        return Proposals.update({_id: proposalId}, {$push: {signatures: Meteor.userId()}});
      }
  },
  addPointFor: function(proposalId, text) {
    Proposals.update({_id: proposalId}, { $push: { pointsFor: text } });
  },
  findProposalsForCronJob: function(){
    /*  
      Finds all expired proposals that have not yet been finalised for vote counting
      and returns an array of their ids
    */
    var now = moment().toDate();
    var proposals = Proposals.find({ $and: [ { endDate: { $lte: now } }, { votesFinalised: false } ] } );
    var ids = proposals.pluck('_id');
    console.log(ids)
    return ids

  },
  prepareVotesForTally: function(proposalIds) {
    console.log('Preparing votes for tally')
    /*
      This method is called within a cron job that runs every 24 hours, at midnight
      It takes an array of proposal ids and creates votes for all users who delegated their votes
      The votes can then be tallied by a single query to the Votes table.
    */

    // For each proposal found:
    for (i=0; i < proposalIds.length; i++){
      var proposalId = proposalIds[i];
      // Find users who did not vote
      var voterIds = Votes.find({proposalId: proposalId}).pluck('voterHash');
      var nonVoterIds = Meteor.users.find({ _id: { $nin: voterIds }}).pluck('_id');

      // For each user who did not vote, get their top delegate vote
      for (j=0; j < nonVoterIds.length; j++) {
        var userId = nonVoterIds[j];
        var delegateInfo = Meteor.call('getUserDelegateInfoForProposal', proposalId, userId);
        if (delegateInfo){
          // Create Vote for user with delegateId
          Votes.insert({
            proposalId: proposalId, 
            vote: delegateInfo.vote, 
            voterHash: userId, 
            delegateId: delegateInfo.id
          });
        }

      }// End of nonVoterIds loop

      // Update proposal votesFinalised flag
      // If the proposal is expired, the votes are finalised.
      var now = moment().toDate();
      if (Proposals.findOne(proposalId).endDate > now){
        Proposals.update({_id: proposalId}, {$set: {votesFinalised: true}});
      }

    } // End proposalIds loop

  },
  getProposalsPublishedStats: function() {
      result = Proposals.aggregate([
      { $group: {
            "_id": "$proposalId",
            "draftUnreviewedCount": {
                "$sum": {$cond: [ {$and : [ { $eq: [ "$stage", "draft"  ] },{ $eq: [ "$status", "unreviewed" ] }]}, 1, 0 ]}
            },
            "draftApprovedCount": {
                "$sum": {
                    $cond: [ {$and : [ { $eq: [ "$stage", "draft"  ] },
                                       { $eq: [ "$status", "approved" ] }
                                     ]}, 1, 0 ]
                }
            },
            "draftRejectedCount": {
                "$sum": {
                    $cond: [ {$and : [ { $eq: [ "$stage", "draft"  ] },
                                       { $eq: [ "$status", "rejected" ] }
                                     ]}, 1, 0 ]
                }
            },
            "submittedReviewedCount": {
                "$sum": {
                    $cond: [ {$and : [ { $eq: [ "$stage", "submitted"  ] },
                                       { $eq: [ "$status", "unreviewed" ] }
                                     ]}, 1, 0 ]
                }
            },
            "submittedApprovedCount": {
                "$sum": {
                    $cond: [ {$and : [ { $eq: [ "$stage", "submitted"  ] },
                                       { $eq: [ "$status", "approved" ] }
                                     ]}, 1, 0 ]
                }
            },
            "submittedRejectedCount": {
                "$sum": {
                    $cond: [ {$and : [ { $eq: [ "$stage", "submitted"  ] },
                                       { $eq: [ "$status", "rejected" ] }
                                     ]}, 1, 0 ]
                }
            },
            "liveUnreviewedCount": {
                "$sum": {
                    $cond: [ {$and : [ { $eq: [ "$stage", "live"  ] },
                                       { $eq: [ "$status", "unreviewed" ] }
                                     ]}, 1, 0 ]
                }
            },
            "liveApprovedCount": {
                "$sum": {
                    $cond: [ {$and : [ { $eq: [ "$stage", "live"  ] },
                                       { $eq: [ "$status", "approved" ] }
                                     ]}, 1, 0 ]
                }
            },
            "liveRejectedCount": {
                "$sum": {
                    $cond: [ {$and : [ { $eq: [ "$stage", "live"  ] },
                                       { $eq: [ "$status", "rejected" ] }
                                     ]}, 1, 0 ]
                }
            },
        }},
      ]);
      //console.log(result);
      return result;
    }
});