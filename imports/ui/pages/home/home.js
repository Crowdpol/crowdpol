import './home.html';

import { Communities } from '../../../api/communities/Communities.js'

Template.Home.onCreated(function() {
  var self = this;

  // Get subdomain from LocalStore and subscribe to community
  var subdomain = LocalStore.get('subdomain');

  self.autorun(function(){
    self.subscribe('communities.subdomain', subdomain, function() {
      // Load homepage background image based on community settings
      var community = Communities.findOne({subdomain: subdomain});
      try {
        var homepageImage = community.settings.homepageImageUrl;
        self.find('.banner-wrap').style.backgroundImage = "url('" + homepageImage + "')";
      } catch(err) {
        console.log(err)
        self.find('.banner-wrap').style.backgroundImage = "url('img/wave-bg.jpg')";
        Bert.alert(TAPi18n.__('pages.home.alerts.no-image'), 'danger');
      }
    });
  });
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
					//console.log(error);
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