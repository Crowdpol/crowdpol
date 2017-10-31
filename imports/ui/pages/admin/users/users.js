import './users.html';
import dialogPolyfill from 'dialog-polyfill';

Template.users.onCreated(function() {
  var self = this;
  self.autorun(function() {
    self.subscribe('users');
  });
});

Template.users.helpers({
  users: ()=> {
    return Meteor.users.find({});
  }
});

Template.users.events({
	'submit form' (event, template){
		event.preventDefault();

		let email = template.find('[name="invite-email"]').value;
			url = Meteor.absoluteUrl('login');

		Meteor.call('sendInvite', email, url, function(error){
			if (error){
				Bert.alert(error.reason, 'danger');
			} else {
				Bert.alert('Message was sent!', 'success');
			}
		});
	},

	'click #delete-button': function(event, template){
		userToDelete = event.target.dataset.userId
		dialog = template.find('dialog');
		dialogPolyfill.registerDialog(dialog);
		dialog.showModal();
	},

	'click #cancel-delete': function(event, template){
		dialog.close();
	},

	'click #confirm-delete': function(event, template){
		Meteor.call('user.delete', userToDelete)
		dialog.close();
	}
});