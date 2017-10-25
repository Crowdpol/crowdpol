import './signup.html';

Template.signup.events({
	'submit form' (event, template){
		event.preventDefault();

		let user = {
			email: template.find('[name="emailAddress"]').value,
			password: template.find('[name="password"]').value
		};

		Accounts.createUser(user, ( error ) => {
			if (error) {
				Bert.alert(error.reason, 'danger');
			} else {
				console.log('everything is ok');
				Meteor.call('sendVerificationLink', (error, response) => {
					if (error){
						Bert.alert(error.reason, 'danger');
					} else {
						Bert.alert('Welcome!', 'success');
					}
				});
			}
		});
	}
});