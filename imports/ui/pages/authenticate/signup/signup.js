import './signup.html';
import './entitySignup.js';
import { Communities } from '../../../../api/communities/Communities.js'

Template.Signup.onCreated(function() {
  var self = this;

  self.autorun(function(){
    self.subscribe('communities.subdomain', LocalStore.get('subdomain'));
  });
});

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

		communityId = Communities.findOne({subdomain: LocalStore.get('subdomain')})._id;

		let user = {
			email: template.find('[name="emailAddress"]').value,
			password: template.find('[name="password"]').value,
			communityId: communityId,
			profile: {communityId: communityId, communitySubdomain: LocalStore.get('subdomain')}
		};

		Accounts.createUser(user, (error) => {
			if (error) {
				Bert.alert(error.reason, 'danger');
			} else {
				console.log(Meteor.userId())
				/* Check if redirect route saved */
				var redirect = LocalStore.get('signUpRedirectURL');
				LocalStore.set('signUpRedirectURL', '');
				if (redirect) {
					window.location.href = redirect;
				} else {
					FlowRouter.go('/proposals');
				}
				
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