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


Template.AdminUsers.helpers({
  users: ()=> {
    return Meteor.users.find({});
  },
  whitelist: ()=> {
	  var community = Communities.findOne({_id: LocalStore.get('communityId')});
	  var settings = community.settings;

	  var enforceWhitelist = settings.enforceWhitelist;

	  if (enforceWhitelist) {
	  	var emails = settings.emailWhitelist;
		  if (emails) {
		  	self.find("#emailWhitelist").value = emails.join(',');
		  	self.find("#whitelistInput").MaterialTextfield.checkDirty()
		  }
	  	var checkbox = self.find('#whitelist-checkbox-label').MaterialCheckbox;
	  	checkbox.check();
	  	return community.settings.enforceWhitelist;
	  }
	 }
});

Template.AdminUsers.events({
	'submit #invite' (event, template){
		event.preventDefault();

		let email = template.find("#invite-email").value;
			role = template.find("#invite-role").value;
			//url = Meteor.absoluteUrl('login');
			fromEmail = Meteor.user().emails[0].address;
			var hostname = window.location.host;
			url = 'https://' + hostname + '/login';
			console.log(url);
		Meteor.call('sendInvite', email, role, url, fromEmail, function(error){
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


	'click #delete-button': function(event, template){
		Meteor.call('deleteUser', event.target.dataset.userId);
	},

	'click .dropdown-item': function(event, template){
		template.find('#invite-role').dataset.val = event.target.dataset.val;
		template.find('#invite-role').value = TAPi18n.__('roles.' + event.target.dataset.val);
	}
});