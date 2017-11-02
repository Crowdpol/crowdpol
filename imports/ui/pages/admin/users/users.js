import './users.html';

Template.users.onCreated(function() {
  var self = this;
  self.autorun(function() {
    self.subscribe('users');
    self.subscribe('users.pendingApprovals');
  });
});

Template.users.helpers({
  users: ()=> {
    return Meteor.users.find({});
  },
  pendingApprovals: ()=> {
    return Meteor.users.find({'profile.approvals.approved':false});
  }
});

Template.users.events({
	'submit form' (event, template){
		event.preventDefault();

		let email = template.find("#invite-email").value;
			role = template.find("#invite-role").value;
			url = Meteor.absoluteUrl('login');

		Meteor.call('sendInvite', email, role, url, function(error){
			if (error){
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