import './signup.html';
import './entitySignup.js';

Template.Signup.onRendered( function() {
  $( "#individual-signup-form" ).validate({
    rules: {
      'emailAddress': {
        required: true
      },
      'password': {
        required: true,
        minlength: 6
      },
    },
    messages: {
      'emailAddress': {
        required: 'Please enter your email address.'
      },
      'password': {
        required: 'Please enter your password.',
        minlength: 'Your password must be at least 6 characters long.'
      },
    }
  });
});

Template.Signup.events({
	'submit #individual-signup-form' (event, template){
		event.preventDefault();

		let user = {
			email: template.find('[name="emailAddress"]').value,
			password: template.find('[name="password"]').value
		};

		Accounts.createUser(user, (error) => {
			if (error) {
				Bert.alert(error.reason, 'danger');
			} else {
				FlowRouter.go('/dash');
				/*Meteor.call('sendVerificationLink', (error, response) => {
					if (error){
						Bert.alert(error.reason, 'danger');
					} else {
						Bert.alert(TAPi18n.__('generic.alerts.welcome'), 'success');
					}
				});*/
			}
		});
	}
});