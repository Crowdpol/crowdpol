import './authenticate.html';
import './signup/signup.js';
import './login/login.js';

Template.Authenticate.events({
	'click #log-out' (event, template){
		event.preventDefault();
		Meteor.logout();
	}
});
