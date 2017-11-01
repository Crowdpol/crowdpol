import './entitySignup.html'

Template.entitySignup.events({
	'submit #entity-signup-form' (event, template){
		event.preventDefault();

		console.log('form submitted')

		let entity = {
			email: template.find('#entity-email').value,
			password: template.find('#entity-password').value,
			name: template.find('#entity-name').value,
			website: template.find('#entity-website').value,
			phone: template.find('#entity-phone').value,
			contact: template.find('#entity-contact').value,
			roles: [template.find('#entity-type').value]
		};

		console.log(entity);

		Accounts.createUser({
			'email': entity.email,
			'password': entity.password,
			'profile.firstName': entity.name,
			'profile.website': entity.website,
			'profile.phoneNumber': entity.phone,
			'profile.contactPerson': entity.contact,
			'roles': entity.roles
			}, 
			(error) => {
				if (error) {
					Bert.alert(error.reason, 'danger');
				} else {
					Meteor.call('sendVerificationLink', (error, response) => {
						if (error){
							Bert.alert(error.reason, 'danger');
						} else {
							Bert.alert('Welcome!', 'success');
						}
					});
				}
			});
	},

	'click .dropdown-item': function(event, template){
		template.find('#entity-type').dataset.val = event.target.dataset.val;
		template.find('#entity-type').value = TAPi18n.__('roles.' + event.target.dataset.val);
	}
});