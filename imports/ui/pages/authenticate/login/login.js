import './login.html';

Template.Login.events({
	'submit #login-form' (event, template){
		event.preventDefault();

		console.log('runnning')

		let email = template.find('[name="login-email"]').value;
			password = template.find('[name="login-password"]').value;

		Meteor.loginWithPassword(email, password, (error) => {
			if (error) {
				Bert.alert(error.reason, 'danger');
			} else {
				FlowRouter.go('/dash');
			}
		});
	}
});