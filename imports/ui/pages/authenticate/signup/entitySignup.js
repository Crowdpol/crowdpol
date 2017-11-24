import './entitySignup.html'

Template.entitySignup.onRendered( function() {
  $( "#entity-signup-form" ).validate({
    rules: {
      'entity-name': {
        required: true
      },
      'entity-email': {
        required: true
      },
      'entity-password': {
        required: true,
        minlength: 6
      },
      'entity-type': {
        required: true
      },
    },
    messages: {
      'entity-name': {
        required: 'Provide a name for your party or organisation.'
      },
      'entity-email': {
        required: 'Please enter a contact email.'
      },
      'entity-password': {
        required: 'Please enter a password.',
        minlength: 'Your password must be at least 6 characters long.'
      },
      'entity-type': {
        required: 'Please select the type of entity you wish to register.'
      },
    }
  });
});

Template.entitySignup.events({
	'submit #entity-signup-form' (event, template){
		event.preventDefault();
		var type = template.find('#entity-type').dataset.val;
		console.log("type: " + type);
		var isParty = null;
		var isOrganisation = null;
		if(type=="party"){
			isParty = true;
			isOrganisation = false;
		}
		if(type=="organisation"){
			isParty = false;
			isOrganisation = true;
		}
		let entity = {
			email: template.find('#entity-email').value,
			password: template.find('#entity-password').value,
			name: template.find('#entity-name').value,
			website: template.find('#entity-website').value,
			phone: template.find('#entity-phone').value,
			contact: template.find('#entity-contact').value,
			roles: [type],
			profileType: "Entity",
			isParty: isParty,
			isOrganisation: isOrganisation,
		};

		//Create entity on the server side so that a role can be assigned automatically
		Meteor.call('addEntity', entity, function(error)	{
			if (error) {
					Bert.alert(error.reason, 'danger');
			} else {
				//Step 1: Log the user in if entity creation was successful
				Meteor.loginWithPassword(entity.email, entity.password);
				//Step 2: Send verification email
				Meteor.call('sendVerificationLink', (error, response) => {
					if (error){
						Bert.alert(error.reason, 'danger');
					} else {
						Bert.alert(TAPi18n.__('alerts.welcome'), 'success');
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