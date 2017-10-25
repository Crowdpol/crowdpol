import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// Import needed templates
import '../../ui/main.js';

Accounts.onLogout(function() {
	FlowRouter.go('App.home');
});

// Set up all routes in the app
FlowRouter.route('/', {
  name: 'App.home',
  action() {
    BlazeLayout.render('App_body', { main: 'Home' });
  },
});

FlowRouter.notFound = {
  action() {
    BlazeLayout.render('App_body', { main: 'App_notFound' });
  },
};


// Email Verification
FlowRouter.route('/verify-email/:token',{
	name: 'verify-email',
	action(params) {
		Accounts.verifyEmail(params.token, (error) => {
			if (error) {
				Bert.alert(error.reason, 'danger');
			} else {
				FlowRouter.go('App.dash');
				Bert.alert('Email verified!', 'success');
			}
		});
	}
}); 

//Password recovery
FlowRouter.route('/forgot-password', {
  name: 'App.password-recovery',
  action() {
   /* if (Accounts._resetPasswordToken) {
    Session.set('resetPassword', Accounts._resetPasswordToken);
  } */
    BlazeLayout.render('App_body', { main: 'passwordRecovery' });
  },
});

FlowRouter.route('/login', {
  name: 'App.login',
  action() {
    BlazeLayout.render('App_body', { main: 'Authenticate' });
  },
});

FlowRouter.route('/dash', {
  name: 'App.dash',
  action() {
    BlazeLayout.render('App_body', { main: 'Dash' });
  },
});

