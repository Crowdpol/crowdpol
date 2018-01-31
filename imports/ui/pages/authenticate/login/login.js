import './login.html';

Template.Login.onRendered( function() {
  $( "#login-form" ).validate({
    rules: {
      'login-email': {
        required: true
      },
      'login-password': {
        required: true
      },
    },
    messages: {
      'login-email': {
        required: 'Please enter your email address.'
      },
      'login-password': {
        required: 'Please enter your password.'
      },
    }
  });
});

Template.Login.events({
	'submit #login-form' (event, template){
		event.preventDefault();
		console.log('running')

		let email = template.find('[name="login-email"]').value;
			password = template.find('[name="login-password"]').value;

		Meteor.loginWithPassword(email, password, (error) => {
			if (error) {
				Bert.alert(error.reason, 'danger');
			} else {
				if (Roles.userIsInRole(Meteor.userId(), ['admin', 'superadmin'])){
					FlowRouter.go('/admin/dash');
				} else {
          /* Check if redirect route saved */
          var redirect = LocalStore.get('signUpRedirectURL');
          LocalStore.set('signUpRedirectURL', '');
          if (redirect) {
            window.location.href = redirect;
          } else {
            FlowRouter.go('/proposals');
          }
				}	
			}
		});
	}
});