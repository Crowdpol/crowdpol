import './authenticate.html';
import './signup/signup.js';
import './login/login.js';
import "../../components/termsModal/termsModal.js"
import RavenClient from 'raven-js';

Template.Authenticate.events({
	'click #log-out' (event, template){
		event.preventDefault();
		Meteor.logout();
	},
	'click #login-facebook'(event) {
		event.preventDefault();
		Meteor.loginWithFacebook({requestPermissions: ['public_profile', 'email']}, function(err){
			if (err) {
				RavenClient.captureException(err);
				Bert.alert(err.reason, 'danger');
			}else{
				FlowRouter.go('/dash');
			}
		});
  },
  'click #login-google'(event) {
    event.preventDefault();
    Meteor.loginWithGoogle({}, function(err,response){
    	if (err) {
      	RavenClient.captureException(err);
        Bert.alert(err.reason, 'danger');
      }else{
				FlowRouter.go('/dash');
      }
    });
	},
	'click #login-twitter'(event) {
	    event.preventDefault();
	    Meteor.loginWithTwitter({}, function(err,response){
	    	if (err) {
	      	RavenClient.captureException(err);
	        Bert.alert(err.reason, 'danger');
	      }else{
					FlowRouter.go('/dash');
	      }
	    });
	},
	/*,
	'click #individual-login-link'(event) {
		$("#indivdual-signup").hide();
		$("#individual-login").show();
	},
	'click #individual-signup-link'(event) {
		$("#individual-login").hide();
		$("#indivdual-signup").show();
	},
	'click #entity-login-link'(event) {
		$("#entity-signup").hide();
		$("#entity-login").show();
	},
	'click #entity-signup-link'(event) {
		$("#entity-login").hide();
		$("#entity-signup").show();
	},
	*/
	'click .dropdown-item': function(event, template){
		entity = event.target.dataset.val
		template.find('#entity-type').dataset.val = entity;
		template.find('#entity-type').value = TAPi18n.__('components.role-selector.' + entity);
		switch (entity) {
		    case 'party':
		        $("#individual-signup-form").hide();
		        $("#entity-signup-form").show();
		        break;
		    case 'organisation':
		        $("#individual-signup-form").hide();
		        $("#entity-signup-form").show();
		        break;
		    case 'individual':
		    	$("#individual-signup-form").show();
		        $("#entity-signup-form").hide();
		        break;
		    default:
		        $("#individual-signup-form").show();
		        $("#entity-signup-form").hide();
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

Template.Authenticate.onRendered( function() {

});
