import "./tags.html";
import { Proposals } from '../../../api/proposals/Proposals.js'

Template.TagSearch.onCreated(function(){	   
	var self = this;
	var keyword = FlowRouter.getParam('keyword');
	self.autorun(function() {
		Meteor.subscribe('proposals.all');
		Meteor.subscribe('users.delegatesWithTag', keyword);
		Meteor.subscribe('users.candidatesWithTag', keyword);
	});
});

Template.TagSearch.helpers({
	keyword(){
		return FlowRouter.getParam('keyword');
	},
	candidates(){
		var keyword = FlowRouter.getParam('keyword');
		return Meteor.users.find({roles: "candidate", 'profile.tags':keyword});
	},
	delegates(){
		var keyword = FlowRouter.getParam('keyword');
		return Meteor.users.find({roles: "delegate", 'profile.tags':keyword});
	},
	proposals(){
		var keyword = FlowRouter.getParam('keyword');
		return Proposals.find({tags: keyword}, {transform: transformProposal});
	}
});

function transformProposal(proposal) { 
  proposal.endDate = moment(proposal.endDate).format('YYYY-MM-DD');;
  return proposal;
};