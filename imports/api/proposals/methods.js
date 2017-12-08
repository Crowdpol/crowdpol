import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Proposals } from './Proposals.js';

Meteor.methods({
    createProposal: function (proposal) {
      check(proposal, { 
        title: String, 
        abstract: String, 
        body: String, 
        startDate: Date, 
        endDate: Date, 
        authorId: String,
        invited: Match.Maybe([String]),
        tags: Match.Maybe([Object])});
      return Proposals.insert(proposal);
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
    signProposal: function(proposalId) {
    check(proposalId, String);
    var user = Meteor.user();
    var proposal = Proposals.findOne(proposalId);
    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to sign a proposal");
    if (!proposal)
      throw new Meteor.Error(422, 'You must sign a proposal');

    //users can not sign the same proposal twice
    var userHasSigned = false;
    if (proposal.signatures){
      if (proposal.signatures.includes(Meteor.userId())){
        userHasSigned = true;
      }
    }
    if (!userHasSigned){
      return Proposals.update({_id: proposalId}, {$push: {signatures: Meteor.userId()}});
    }
  },
});