import './signup.html';
import './entitySignup.js';
import "../../../components/termsModal/termsModal.js"
import { Communities } from '../../../../api/communities/Communities.js'
import RavenClient from 'raven-js'

Template.Signup.onCreated(function() {
	var self = this;

	self.autorun(function(){
		self.subscribe('communities.subdomain', LocalStore.get('subdomain'));
	});
});

Template.Signup.onRendered( function() {

	Session.set('termsAccepted', false);

	$( "#individual-signup-form" ).validate({
		rules: {
			'emailAddress': {
				required: true
			},
			'password': {
				required: true,
				minlength: 6
			}
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

		var community = Communities.findOne({subdomain: LocalStore.get('subdomain')});
		var enforceWhitelist = community.settings.enforceWhitelist;
		var emailWhitelist = community.settings.emailWhitelist;
		var email = template.find('[name="emailAddress"]').value;

		if ((!enforceWhitelist) || (enforceWhitelist == false) || ((enforceWhitelist == true) && (emailWhitelist.includes(email)))) {
			if(Session.get('termsAccepted')){
				communityId = community._id;
				var termsAccepted = $('#terms-checkbox-label').hasClass('is-checked');

				let user = {
					email: email,
					password: template.find('[name="password"]').value,
					profile: {communityIds: [communityId], termsAccepted: termsAccepted}
				};

				Accounts.createUser(user, (error) => {
					if (error) {
						RavenClient.captureException(error);
						Bert.alert(error.reason, 'danger');
					} else {
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
			} else {
				Bert.alert(TAPi18n.__('pages.signup.accept-terms'), 'danger')
			}
		} else {
			Bert.alert(TAPi18n.__('pages.signup.not-in-whitelist'), 'danger')
		}

		
	},
	'click #terms-checkbox-label' (event, template) {
		var termsCheckbox = self.find('#terms-checkbox-label').MaterialCheckbox;
		var termsAccepted = $('#terms-checkbox-label').hasClass('is-checked');
		if (termsAccepted) {  
			termsCheckbox.uncheck();
			Session.set('termsAccepted', false);
		} else {
			event.preventDefault();
			openTermsModal();
		}

	}
});