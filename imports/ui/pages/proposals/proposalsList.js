import './proposalsList.html'
import { Proposals } from '../../../api/proposals/Proposals.js'

Template.ProposalsList.onCreated(function () {
  var self = this;
  self.autorun(function(){
    self.subscribe('proposals.open');
    self.subscribe('proposals.closed');
    self.subscribe('proposals.author');
    self.subscribe('proposals.invited');
  });
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
  }
});

Template.ProposalsList.events({
	'keyup #delegate-search': function(event, template){
		Session.set('searchPhrase',event.target.value);
	}
});

function transformProposal(proposal) { 
  proposal.endDate = moment(proposal.endDate).format('MMMM Do YYYY, h:mm:ss a');
  
  return proposal;
};
