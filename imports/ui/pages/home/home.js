import './home.html';
import RavenClient from 'raven-js';

import { Communities } from '../../../api/communities/Communities.js'

Template.Home.onCreated(function() {
  var self = this;
  self.community = new ReactiveVar();

  // Get subdomain from LocalStore and subscribe to community
  var subdomain = LocalStore.get('subdomain');

  self.autorun(function(){
    self.subscribe('communities.subdomain', subdomain, function(){
    	self.community.set(Communities.findOne({subdomain: subdomain}))
    });
  });
});

Template.Home.helpers({
	backgroundImage: function() {
		var imagePath = Template.instance().community.get().settings.homepageImageUrl;
		//console.log(imagePath);
		return "url('" + imagePath + "')"
	},
	heading: function() {
		return Template.instance().community.get().name;
	},
	introText: function() {
		return Template.instance().community.get().settings.homepageIntroText;
	},
	bannerText: function() {
		return Template.instance().community.get().settings.homepageBannerText;
	},
});

Template.Home.events({
	'submit #newletterSignupForm' (event, template){
		event.preventDefault();
	},
	'keyup #signupEmail' (event, template){
	  $("#newletterSignupForm").validate({
	    rules: {
	      signupEmail: {
	        required: true
	      },
	    },
	    messages: {
	      signupEmail: {
	        required: "Email required."
	      }
	    },
	    submitHandler() {
			let email = template.find('[name="signupEmail"]').value;
			Meteor.call("signupNewsletter",email,function(error,result){
				if (error){
					RavenClient.captureException(error);
					Bert.alert(error.message, 'danger');
				} else {
					//console.log("success");
					Bert.alert(TAPi18n.__('pages.home.alerts.mailing-list-signup-success'), 'success');
				}
			});
		}
	  });
	}
});
/*
$.validator.addMethod(
        "isEmail",
        function(value, element) {
        	var regex = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
            email = $("#submit-newsletter").val();
            console.log(regex.test(email));
            return false;
        },
        "Valid email required."
    );
    */
