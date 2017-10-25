import './login.html';

Template.login.events({
	'submit form' (event, template){
		event.preventDefault();

		let email = template.find('[name="login-email"]').value;
			password = template.find('[name="login-password"]').value;

		Meteor.loginWithPassword(email, password, (error) => {
			if (error) {
				Bert.alert(error.reason, 'danger');
			} else {
				FlowRouter.go('/');
			}
		});
	}
});