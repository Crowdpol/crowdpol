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
				// Create notification
      			var message = TAPi18n.__('notifications.proposals.approved');
      			var url = '/proposals/view/' + proposalId;
      			Meteor.call('createNotification', {message: message, userId: Meteor.userId(), url: url, icon: 'check'});
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
				var message = TAPi18n.__('notifications.proposals.rejected');
      			var url = '/proposals/view/' + proposalId;
      			Meteor.call('createNotification', {message: message, userId: Meteor.userId(), url: url, icon: 'do_not_disturb'})
				Bert.alert(TAPi18n.__('admin.alerts.proposal-rejected'), 'success');
			}
		}); 
	}
});
