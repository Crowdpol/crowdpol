import './index.html';

Template.index.events({
	'click .resend-verification-link' (event, template){
		Meteor.call('sendVerificationLink', (error, response) => {
			if (error){
				Bert.alert(error.reason, 'danger');
			} else {
				let email = Meteor.user().emails[0].address;
				Bert.alert('Verification sent to ${email}', 'success');
			}
		});
	},

	'click #log-out' (event, template){
		event.preventDefault();
		Meteor.logout();
	}
});