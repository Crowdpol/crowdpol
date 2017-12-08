import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Proposals } from './Proposals.js';

Meteor.methods({
    createProposal: function (proposal) {
      //try{
        check(proposal, { 
          title: String, 
          abstract: String, 
          body: String, 
          startDate: Date, 
          endDate: Date, 
          authorId: String,
          invited: Match.Maybe([String]),
          tags: Match.Maybe([Object]),
          pointsFor: Match.Maybe([String]),
          pointsAgainst: Match.Maybe([String]),
          references: Match.Maybe([String])
        });
        result = Proposals.insert(proposal);
        return result;
      //} catch (err) {
        //console.log(err);
        //return err;
      //}
    },
    getProposal: function (proposalId) {
      check(proposalId, String);
      return Proposals.findOne({_id: proposalId});
    },
    deleteProposal: function (proposalId) {
      check(proposalId, String);
      Proposals.remove(proposalId);
    },
    rejectProposal: function (proposalId) {
      check(proposalId, String);
    	Proposals.update({_id: proposalId}, {$set: {"status": "rejected"}});
    },
    approveProposal: function(proposalId){
      check(proposalId, String);
      Proposals.update({_id: proposalId}, {$set: {"stage": "live"}});
      Proposals.update({_id: proposalId}, {$set: {"status": "approved"}});
    },
    updateProposalStage: function(proposalId, stage){
      check(proposalId, String);
      check(stage, String);
      Proposals.update({_id: proposalId}, {$set: {"stage": stage}});
    },
    saveProposalChanges: function (proposalId, proposal) {
      check(proposalId, String);
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
    addPointFor: function(proposalId, text) {
      Proposals.update({_id: proposalId}, { $push: { pointsFor: text } });
    },
});