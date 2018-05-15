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
		console.log("fb click");
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
	}
});

Template.Authenticate.onRendered( function() {
	if (Meteor.user()){
		console.log("user signed in... redirect");
	}else{
		console.log("login page rendered");
	}
});
