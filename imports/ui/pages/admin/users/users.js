import './users.html';
import RavenClient from 'raven-js';
import { Communities } from '../../../../api/communities/Communities.js'

Template.AdminUsers.onCreated(function() {
  var self = this;
  communityId = LocalStore.get('communityId');
  self.autorun(function() {
    self.subscribe('users.community', communityId);
    self.subscribe('community', communityId);
  });
});

Template.AdminUsers.onRendered(function() {
  var self = this;
  
  communityId = LocalStore.get('communityId');
  var settings = Communities.findOne({_id: communityId}).settings;
  var emails = settings.emailWhitelist;
  if (emails) {
  	self.find("#emailWhitelist").value = emails.join(',');
  	self.find("#whitelistInput").MaterialTextfield.checkDirty()
  }

  var enforceWhitelist = settings.enforceWhitelist;

  if (enforceWhitelist) {
  	var checkbox = self.find('#whitelist-checkbox-label').MaterialCheckbox;
  	checkbox.check();
  }
  	
});

Template.AdminUsers.helpers({
  users: ()=> {
    return Meteor.users.find({});
  },
  community: ()=> {
  	return Communities.findOne({_id: communityId});
  },
});

Template.AdminUsers.events({
	'submit #invite' (event, template){
		event.preventDefault();

		let email = template.find("#invite-email").value;
			role = template.find("#invite-role").value;
			url = Meteor.absoluteUrl('login');

		Meteor.call('sendInvite', email, role, url, function(error){
			if (error){
				RavenClient.captureException(error);
				Bert.alert(error.reason, 'danger');
			} else {
				Bert.alert('Message was sent!', 'success');
			}
		});
	},

	'submit #community-whitelist-form' (event, template){
		event.preventDefault();

		let emails = template.find("#emailWhitelist").value.split(',');
			enforceWhitelist = $('#whitelist-checkbox-label').hasClass('is-checked');

		Meteor.call('updateWhitelistSettings', emails, enforceWhitelist, communityId, function(error){
			if (error){
				RavenClient.captureException(error);
				Bert.alert(error.reason, 'danger');
			} else {
				Bert.alert(TAPi18n.__('admin.users.whitelist-updated'), 'success');
			}
		});
	},


	'click .delete-button': function(event, template){
		Meteor.call('deleteUser', event.target.dataset.userId);
	},

	'click .dropdown-item': function(event, template){
		template.find('#invite-role').dataset.val = event.target.dataset.val;
		template.find('#invite-role').value = TAPi18n.__('roles.' + event.target.dataset.val);
	}
});