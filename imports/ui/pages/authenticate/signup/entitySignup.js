import './entitySignup.html'
import { hasOwnProperty } from '../../../../utils/functions';
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
  Session.set("termsAccepted",true);
  document.querySelector('.terms-checkbox').checked = true;
});

Template.entitySignup.events({
	'submit #entity-signup-form' (event, template){
		event.preventDefault();
		role = $('#entity-type').attr('data-val');//template.find('#entity-type').dataset.val;

		communityId = Communities.findOne({subdomain: LocalStore.get('subdomain')})._id;
    var community = Communities.findOne({subdomain: LocalStore.get('subdomain')});
    if(!hasOwnProperty(community,'settings')){
      Bert.alert('Community does not have settings', 'danger');
      return;
    }
    var enforceWhitelist = community.settings.enforceWhitelist;
    if(!hasOwnProperty(community.settings,'enforceWhitelist')){
      Bert.alert('Community does not have settings.enforceWhitelist', 'danger');
      return;
    }
    var emailWhitelist = community.settings.emailWhitelist;
    if(!hasOwnProperty(community.settings,'emailWhitelist')){
      Bert.alert('Community does not have settings.emailWhitelist', 'danger');
      return;
    }
    var email = template.find('[name="entity-email"]').value;

    if ((!enforceWhitelist) || (enforceWhitelist == false) || ((enforceWhitelist == true) && (emailWhitelist.includes(email)))) {
      termsAccepted = Session.get("termsAccepted");
      if(termsAccepted){
    		// Update profile
        profile = {
          'firstName': template.find('#entity-name').value,
          'website': template.find('#entity-website').value,
          'phoneNumber': template.find('#entity-phone').value,
          'contactPerson': template.find('#entity-contact').value,
          'type': 'Entity',
          'communityIds': [communityId],
          'roles': [role],
          termsAccepted: termsAccepted
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
             var user = Meteor.user();
             var userRoles = user.roles;
             //console.log(userRoles);
             if (user && userRoles) {
               if(userRoles.indexOf("delegate") > -1){
                 LocalStore.set('isDelegate',true);
               }else{
                 LocalStore.set('isDelegate',false);
               }
               if(userRoles.indexOf("individual") > -1){
                 LocalStore.set('currentUserRole','individual');
               }
               if(userRoles.indexOf("organisation") > -1){
                 LocalStore.set('currentUserRole','organisation');
               }
               if(userRoles.indexOf("party") > -1){
                 LocalStore.set('currentUserRole','party');
               }
               if(userRoles.indexOf("delegate") > -1){
                 LocalStore.set('isDelegate',true);
                 LocalStore.set('otherRole','delegate');
               }else{
                 LocalStore.set('isDelegate',false);
                 LocalStore.set('otherRole','');
               }
             }
             //console.log(LocalStore.get('currentUserRole'));
             //console.log(LocalStore.get('isDelegate'));
             //console.log("entity user created, now redirect given, redirecting to /dash");
             FlowRouter.go('/dash');
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
