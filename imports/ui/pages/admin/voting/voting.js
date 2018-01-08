import './voting.html';
import { Proposals } from '../../../../api/proposals/Proposals.js'
import { Votes } from '../../../../api/votes/Votes.js'

Template.AdminVoting.onCreated(function() {
  var self = this;
  self.tallyInProgress = new ReactiveVar(false);
  self.autorun(function() {
    self.subscribe('proposals.public');
    self.subscribe('votes.all');
  });
});

Template.AdminVoting.helpers({
  proposals: function() {
  	// only display expired proposals that are public
  	return Proposals.find({endDate:{"$lte": new Date()}, stage: "live"}, {sort: {endDate: -1}});
  },
  tallyInProgress: function(){
  	return Template.instance().tallyInProgress.get();
  },
  yesCount: function(proposalId) {
  	return Votes.find({proposalId: proposalId, vote: 'yes'}).count();
  },
  noCount: function(proposalId) {
  	return Votes.find({proposalId: proposalId, vote: 'no'}).count();
  },
  voteCount: function(proposalId) {
  	return Votes.find({proposalId: proposalId}).count();
  }
});

Template.AdminVoting.events({

	'click #tally-votes-button': function(event, template){
		proposalId = event.target.dataset.proposalId;
		template.tallyInProgress.set(true);
		Meteor.call('prepareVotesForTally', [proposalId], function(error){
			if (error){
				Bert.alert(error.reason, 'danger');
			}
			template.tallyInProgress.set(false);
		}); 
		
	},
});
