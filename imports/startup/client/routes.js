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
FlowRouter.route('/reset-password/:token?', {
  name: 'App.password-recovery',
  action(params) {
    if (params.token) {
      Accounts._resetPasswordToken = params.token
      BlazeLayout.render('App_body', { main: 'newPassword' });
    } else {
      BlazeLayout.render('App_body', { main: 'recoverPassword' });
    }
  }
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

