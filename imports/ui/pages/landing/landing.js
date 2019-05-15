import './landing.html'
import RavenClient from 'raven-js';

Template.Landing.onCreated(function(){
  // Set the date we're counting down to
  let countDownDate = new Date("Sep 14, 2019 23:59:59").getTime();

  self = this;
  self.timeRemaining = new ReactiveVar();
  self.timeRemaining.set('expired');
  Session.set("interval","expired");

  /*
  Meteor.setInterval(function() {
    console.log("test");
  }, 1000);
  */
  // Update the count down every 1 second
  var x = setInterval(function() {

    // Get todays date and time
    var now = new Date().getTime();
    // Find the distance between now and the count down date
    var timeRemaining = countDownDate - now;
    //console.log("timeRemaining: " + timeRemaining);
    self.timeRemaining.set(timeRemaining);
    Session.set("interval",timeRemaining);

    // Time calculations for days, hours, minutes and seconds
    var days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    var hours = (Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))+2); //UTC + 2
    var minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    $("#days").html(days);
    $("#hours").html(hours);
    $("#minutes").html(minutes);
    $("#seconds").html(seconds);

    // If the count down is finished, write some text
    if (timeRemaining < 0) {
      clearInterval(x);
      self.timeRemaining.set('expired');
    }
  }, 1000);
});


Template.Landing.helpers({
	days: function(){
    console.log(Template.instance().timeRemaining.get());
    /*
    let distance = Template.instance().timeRemaining.get();
    if(distance!=='expired'){
      return Math.floor(distance / (1000 * 60 * 60 * 24));
    }
    */
    return '00';

  },
  hours: function(){
    /*
    let distance = Template.instance().timeRemaining.get();
    if(distance!=='expired'){
      return Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    }
    */
    return '00';
  },
  minutes: function(){
    /*
    let distance = Template.instance().timeRemaining.get();
    if(distance!=='expired'){
      return Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    }
    */
    return '00';
  },
  seconds: function(){
    /*
    let distance = Template.instance().timeRemaining.get();
    if(distance!=='expired'){
      return Math.floor((distance % (1000 * 60)) / 1000);
    }
    */
    return '00';
  },
});

Template.Landing.events({
	'submit #newletterSignupForm' (event, template){
		event.preventDefault();
    let email = template.find('[name="signupEmail"]').value;
    if(validateEmail(email)){
      Meteor.call("signupNewsletter",email,function(error,result){
        if (error){
          RavenClient.captureException(error);
          Bert.alert(error.message, 'danger');
        } else {
          Bert.alert(TAPi18n.__('pages.home.alerts.mailing-list-signup-success'), 'success');
        }
      });
    }else{
      Bert.alert(TAPi18n.__('pages.proposals.edit.alerts.bad-email'), 'success');
    }
	},
  /*
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
					Bert.alert(TAPi18n.__('pages.home.alerts.mailing-list-signup-success'), 'success');
				}
			});
		}
	  });
	}
  */
});

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
