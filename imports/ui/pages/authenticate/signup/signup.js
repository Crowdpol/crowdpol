import './signup.html';
import './entitySignup.js';
//import './signupWizard.js';
import "../../../components/termsModal/termsModal.js"
import { hasOwnProperty } from '../../../../utils/functions';
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
		var communityId = LocalStore.get('communityId');
		var email = template.find('[name="emailAddress"]').value;
		/*
		if(!hasOwnProperty(community,'settings')){
			Bert.alert('Community does not have settings', 'danger');
			return;
		}
		var enforceWhitelist = community.settings.enforceWhitelist;
		if(!hasOwnProperty(community.settings,'enforceWhitelist')){
			Bert.alert('Community does not have settings.enforceWhitelist', 'danger');
			return;
		}
		var emailWhitelist = community.settings.emailWhitelist;
		if(!hasOwnProperty(community.settings,'emailWhitelist')){
			Bert.alert('Community does not have settings.emailWhitelist', 'danger');
			return;
		}

		if ((!enforceWhitelist) || (enforceWhitelist == false) || ((enforceWhitelist == true) && (emailWhitelist.includes(email)))) {
		*/
			if(Session.get('termsAccepted')){
				//communityId = community._id;
				var termsAccepted = $('#terms-checkbox-label').hasClass('is-checked');

				let user = {
					email: email,
					password: template.find('[name="password"]').value,
					profile: {communityIds: [communityId], termsAccepted: termsAccepted}
				};
				//check if the user email already has an account
				if(checkUserExists(email,communityId)){
					//console.log("checked user exists, redirecting to /dash");
					//FlowRouter.go('/dash');
				}else{
					Accounts.createUser(user, (error) => {
						if (error) {
							RavenClient.captureException(error);
							Bert.alert(error.reason, 'danger');
						} else {
							/* Check if redirect route saved */
							var redirect = LocalStore.get('signUpRedirectURL');
							LocalStore.set('signUpRedirectURL', '');
							if (redirect){
								window.location.href = redirect;
							} else {
								var user = Meteor.user();
	              var userRoles = user.roles;
	              //console.log(userRoles);
	              if (user && userRoles) {
	                if(userRoles.indexOf("delegate") > -1){
	                  LocalStore.set('isDelegate',true);
	                }else{
	                  LocalStore.set('isDelegate',false);
	                }
	                if(userRoles.indexOf("individual") > -1){
	                  LocalStore.set('currentUserRole','individual');
	                }
	                if(userRoles.indexOf("organisation") > -1){
	                  LocalStore.set('currentUserRole','organisation');
	                }
	                if(userRoles.indexOf("party") > -1){
	                  LocalStore.set('currentUserRole','party');
	                }
	                if(userRoles.indexOf("delegate") > -1){
	                  LocalStore.set('isDelegate',true);
	                  LocalStore.set('otherRole','delegate');
	                }else{
	                  LocalStore.set('isDelegate',false);
	                  LocalStore.set('otherRole','');
	                }
	              }
	              //console.log(LocalStore.get('currentUserRole'));
	              //console.log(LocalStore.get('isDelegate'));
								//console.log("user created, redirecting to /dash");
								FlowRouter.go('/wizard');
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
			} else {
				Bert.alert(TAPi18n.__('pages.signup.accept-terms'), 'danger')
			}
		/*
		} else {
			Bert.alert(TAPi18n.__('pages.signup.not-in-whitelist'), 'danger')
		}
		*/

	}
});

function checkUserExists(email,communityId){
	Meteor.call('checkIfUserExists',email,communityId, (error, response) => {
		if (error){
			//user email not found, create a new account
			Bert.alert(error.reason, 'danger');
			return false;
		} else {
			//user email found, adding community to user profile
			//Bert.alert("found email", 'success');
			return true;
		}
	});
	return false;
}
