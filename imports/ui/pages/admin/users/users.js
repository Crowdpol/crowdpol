import './users.html';
import RavenClient from 'raven-js';

Template.AdminUsers.onCreated(function() {
  var self = this;
  var communityId = LocalStore.get('communityId');
  self.autorun(function() {
    self.subscribe('users.community', communityId);
  });
});

Template.AdminUsers.helpers({
  users: ()=> {
    return Meteor.users.find({});
  },
});

Template.AdminUsers.events({
	'submit form' (event, template){
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

	'click #delete-button': function(event, template){
		Meteor.call('deleteUser', event.target.dataset.userId);
	},

	'click .dropdown-item': function(event, template){
		template.find('#invite-role').dataset.val = event.target.dataset.val;
		template.find('#invite-role').value = TAPi18n.__('roles.' + event.target.dataset.val);
	}
});