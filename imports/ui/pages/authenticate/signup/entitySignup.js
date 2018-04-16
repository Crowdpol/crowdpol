import './entitySignup.html'
import RavenClient from 'raven-js';
import { Communities } from '../../../../api/communities/Communities.js'

Template.entitySignup.onCreated(function() {
  var self = this;

  self.autorun(function(){
    self.subscribe('communities.subdomain', LocalStore.get('subdomain'));
  });
});

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
		role = template.find('#entity-type').dataset.val;

		communityId = Communities.findOne({subdomain: LocalStore.get('subdomain')})._id;

		// Update profile
    profile = {
      'firstName': template.find('#entity-name').value,
      'website': template.find('#entity-website').value,
      'phoneNumber': template.find('#entity-phone').value,
      'contactPerson': template.find('#entity-contact').value,
      'type': 'Entity',
      'communityIds': [communityId],
      'roles': [role, 'delegate']
    };

    entity = {
     'email': template.find('#entity-email').value,
     'password': template.find('#entity-password').value,
     'isPublic' : true,
     profile: profile
   };

   Accounts.createUser(entity, (error) => {
     if (error) {
      RavenClient.captureException(error);
      Bert.alert(error.reason, 'danger');
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
 });
 },

	'click .dropdown-item': function(event, template){
		template.find('#entity-type').dataset.val = event.target.dataset.val;
		template.find('#entity-type').value = TAPi18n.__('roles.' + event.target.dataset.val);
	}
});