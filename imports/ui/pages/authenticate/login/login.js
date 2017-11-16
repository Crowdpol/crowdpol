import './login.html';

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
					FlowRouter.go('/dash');
				}	
			}
		});
	}
});