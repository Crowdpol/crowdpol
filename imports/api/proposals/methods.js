import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Proposals } from './Proposals.js';

Meteor.methods({
    createProposal: function (title, abstract, body, startDate, endDate, authorId) {
      check(title, String);
      check(abstract, String);
      check(body, String);
      check(startDate, Date);
      check(endDate, Date);
      check(authorId, String);
      return Proposals.insert({ 
      	title: title,
      	abstract: abstract,
      	body: body,
      	startDate: startDate,
      	endDate: endDate,
      	authorId: authorId
      });
    },
    getProposal: function (proposalID) {
      return Proposals.findOne({_id: proposalID});
    },
    deleteProposal: function (proposalID) {
      Proposals.remove(proposalID);
    },
    updateProposalStatus: function (proposalID, status) {
    	Proposals.update({_id: proposalID}, {$set: {"status": status}});
    },
    updateProposalStage: function (proposalID, stage){
    	Proposals.update({_id: proposalID}, {$set: {"stage": stage}});
    }
});