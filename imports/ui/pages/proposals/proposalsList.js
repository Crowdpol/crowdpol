import './proposalsList.html'
import { Proposals } from '../../../api/proposals/Proposals.js'

Template.ProposalsList.onCreated(function () {
  var self = this;
  self.autorun(function(){
    self.subscribe('proposals.all');
  });
});

Template.ProposalsList.helpers({
  proposals: function() {
    return Proposals.find({}, {transform: transformProposal, sort: {createdAt: -1}});
  },
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
