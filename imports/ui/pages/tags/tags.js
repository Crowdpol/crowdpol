import "./tags.html";
import { Proposals } from '../../../api/proposals/Proposals.js'

Template.TagSearch.onCreated(function(){	   
	var self = this;
	var keyword = FlowRouter.getParam('keyword');
	self.autorun(function() {
		Meteor.subscribe('proposals.public');
		Meteor.subscribe('proposals.author');
		Meteor.subscribe('proposals.invited');
		//Meteor.subscribe('users.delegatesWithTag', keyword, communityId);
		//Meteor.subscribe('users.candidatesWithTag', keyword, communityId);
	});
});

Template.TagSearch.helpers({
	keyword(){
		return FlowRouter.getParam('keyword');
	},
	candidates(){
		var keyword = FlowRouter.getParam('keyword');
		return Meteor.users.find({roles: 'candidate', 'profile.tags': { $elemMatch: {keyword: keyword}}});
	},
	delegates(){
		var keyword = FlowRouter.getParam('keyword');
		return Meteor.users.find({roles: 'delegate', 'profile.tags': { $elemMatch: {keyword: keyword}}});
	},
	proposals(){
		var keyword = FlowRouter.getParam('keyword');
		return Proposals.find({tags: { $elemMatch: {keyword: keyword}}}, {transform: transformProposal});
	}
});

function transformProposal(proposal) { 
  proposal.endDate = moment(proposal.endDate).format('YYYY-MM-DD');;
  return proposal;
};