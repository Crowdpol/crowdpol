import './proposalsList.html'
import { Proposals } from '../../../api/proposals/Proposals.js'

Template.ProposalsList.onCreated(function () {
  var self = this;
  self.autorun(function(){
    self.subscribe('proposals.open');
    self.subscribe('proposals.closed');
    self.subscribe('proposals.author', Meteor.userId());
    self.subscribe('proposals.invited');
  });
  self.openProposals = new ReactiveVar(true);
});

Template.ProposalsList.helpers({
  closedProposals: function() {
    return Proposals.find({endDate:{"$lte": new Date()}, stage: 'live'}, {transform: transformProposal, sort: {createdAt: -1}});
  },
  openProposals: function() {
    return Proposals.find({endDate:{"$gte": new Date()}, stage: 'live'}, {transform: transformProposal, sort: {createdAt: -1}});
  },
  myProposals: function(){
    return Proposals.find({authorId: Meteor.userId()});
  },
  openSelected: function(){
    return Template.instance().openProposals.get();
  },
});

Template.ProposalsList.events({
	'click #add-new-proposal': function(event, template){
    FlowRouter.go('App.proposal.edit', {id: ''});
	},
  'click #open-closed-switch': function(event, template){
    Template.instance().openProposals.set(event.target.checked);
  }
});

function transformProposal(proposal) { 
  proposal.endDate = moment(proposal.endDate).format('MMMM Do YYYY, h:mm:ss a');
  
  return proposal;
};
