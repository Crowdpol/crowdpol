import './proposals.html';
import { Proposals } from '../../../../api/proposals/Proposals.js'
import RavenClient from 'raven-js';

Template.AdminProposals.onCreated(function() {
  var self = this;
  var communityId = LocalStore.get('communityId')
  self.autorun(function() {
    self.subscribe('proposals.community', communityId);
  });
});

Template.AdminProposals.helpers({
  proposals: function() {
    return Proposals.find({stage: "submitted", status: "unreviewed"});
  },
});

Template.AdminProposals.events({

	'click #approve-button': function(event, template){
		proposalId = event.target.dataset.proposalId;
		Meteor.call('approveProposal', proposalId, function(error){
			if (error){
				RavenClient.captureException(error);
				Bert.alert(error.reason, 'danger');
			} else {
				Bert.alert(TAPi18n.__('admin.alerts.proposal-approved'), 'success');
			}
		}); 
		
	},
	'click #reject-button': function(event, template){
		proposalId = event.target.dataset.proposalId;
		Meteor.call('rejectProposal', proposalId,function(error){
			if (error){
				RavenClient.captureException(error);
				Bert.alert(error.reason, 'danger');
			} else {
				Bert.alert(TAPi18n.__('admin.alerts.proposal-rejected'), 'success');
			}
		}); 
	}
});
