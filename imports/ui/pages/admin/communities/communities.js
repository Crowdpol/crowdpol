import './communities.html';
import { Communities } from '../../../../api/communities/Communities.js'
import RavenClient from 'raven-js';

Template.AdminCommunities.onCreated(function() {
  var self = this;
  self.autorun(function() {
    self.subscribe('communities.all');
    self.subscribe('users.all');
  });
});

Template.AdminCommunities.helpers({
  communities: function() {
    return Communities.find({});
  },
  userCount: function(communityId) {
  	return Meteor.users.find({'profile.communityIds': communityId}).count();
  }
});

Template.AdminCommunities.events({

	'click #create-new': function(event, template){
		proposalId = event.target.dataset.proposalId;
		Meteor.call('approveProposal', proposalId, function(error){
			if (error){
				RavenClient.captureException(error);
				Bert.alert(error.reason, 'danger');
			} else {
				Bert.alert(TAPi18n.__('admin.alerts.proposal-approved'), 'success');
			}
		}); 
		
	}
});