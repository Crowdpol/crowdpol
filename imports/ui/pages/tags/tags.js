import "./tags.html";
import { Proposals } from '../../../api/proposals/Proposals.js'

Template.TagSearch.onCreated(function(){	   
	var self = this;
	var keyword = FlowRouter.getParam('keyword');
	var communityId = LocalStore.get('communityId');
	Session.set('back',window.location.pathname);
	self.autorun(function() {
		Meteor.subscribe('proposals.public', '', communityId);
		Meteor.subscribe('proposals.author', '', communityId);
		Meteor.subscribe('proposals.invited', Meteor.userId(), '', communityId);
		Meteor.subscribe('users.delegatesWithTag', keyword, communityId);
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
		delegates = Meteor.users.find({roles: 'delegate', 'profile.tags': { $elemMatch: {keyword: keyword}}});
		if(delegates.count()){
			return delegates;
		}
		return null;
	},
	proposals(){
		var keyword = FlowRouter.getParam('keyword');
		proposals = Proposals.find({tags: { $elemMatch: {keyword: keyword}}}, {transform: transformProposal});
		if(proposals.count()){
			return proposals;
		}
		return null;
	}
});

function transformProposal(proposal) { 
  proposal.endDate = moment(proposal.endDate).format('YYYY-MM-DD');
  proposal.startDate = moment(proposal.startDate).format('YYYY-MM-DD');
  return proposal;
};