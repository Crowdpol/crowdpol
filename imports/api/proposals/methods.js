import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Proposals } from './Proposals.js';

Meteor.methods({
    createProposal: function (proposal) {
      check(proposal.title, String);
      check(proposal.abstract, String);
      check(proposal.body, String);
      check(proposal.startDate, Date);
      check(proposal.endDate, Date);
      check(proposal.authorId, String);
      return Proposals.insert(proposal);
    },
    getProposal: function (proposalId) {
      return Proposals.findOne({_id: proposalId});
    },
    deleteProposal: function (proposalId) {
      Proposals.remove(proposalId);
    },
    rejectProposal: function (proposalId) {
    	Proposals.update({_id: proposalId}, {$set: {"status": "rejected"}});
    },
    approveProposal: function(proposalId){
      Proposals.update({_id: proposalId}, {$set: {"stage": "live"}});
      Proposals.update({_id: proposalId}, {$set: {"status": "approved"}});
    },
    updateProposalStage: function(proposalId, stage){
      Proposals.update({_id: proposalId}, {$set: {"stage": stage}});
    },
    saveProposalChanges: function (proposalId, proposal) {
      Proposals.update({_id: proposalId}, {$set: proposal });
    },
    addTag: function(proposalId, tag) {
      Proposals.update({_id: proposalId}, {$push: {tags: tag} });
    },
    removeTag: function(proposalId, tag) {
      Proposals.update({_id: proposalId}, {$pull: {tags: tag} });
    },
});