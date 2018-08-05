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
		role = $('#entity-type').attr('data-val');//template.find('#entity-type').dataset.val;

		communityId = Communities.findOne({subdomain: LocalStore.get('subdomain')})._id;
    var community = Communities.findOne({subdomain: LocalStore.get('subdomain')});
    var enforceWhitelist = community.settings.enforceWhitelist;
    var emailWhitelist = community.settings.emailWhitelist;
    var email = template.find('[name="entity-email"]').value;

    if ((!enforceWhitelist) || (enforceWhitelist == false) || ((enforceWhitelist == true) && (emailWhitelist.includes(email)))) {
      termsAccepted = $('#terms-checkbox-label').hasClass('is-checked');
      if(termsAccepted){
    		// Update profile
        profile = {
          'firstName': template.find('#entity-name').value,
          'website': template.find('#entity-website').value,
          'phoneNumber': template.find('#entity-phone').value,
          'contactPerson': template.find('#entity-contact').value,
          'type': 'Entity',
          'communityIds': [communityId],
          'roles': [role, 'delegate'],
          termsAccepted: termsAccepted
        };

        entity = {
         'email': template.find('#entity-email').value,
         'password': template.find('#entity-password').value,
         'isPublic' : true,
         profile: profile
       };
       console.log("termsAccepted: " + termsAccepted);
       console.log(entity);

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
      } else {
        Bert.alert(TAPi18n.__('pages.signup.accept-terms'), 'danger')
      }
    } else {
      Bert.alert(TAPi18n.__('pages.signup.not-in-whitelist'), 'danger')
    }
  }
});