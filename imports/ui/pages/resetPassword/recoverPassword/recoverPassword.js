import './recoverPassword.html'
import RavenClient from 'raven-js';

Template.recoverPassword.onRendered( function() {
  $( "#recover-password" ).validate({
    rules: {
      'recovery-email': {
        required: true,
      },
    },
    messages: {
      'recovery-email': {
        required: 'Please enter your new recovery email address.',
      },
    }
  });
});

Template.recoverPassword.events({
    'submit #recover-password': function(event, template) {
        event.preventDefault()
        var email = template.find('[name="recovery-email"]').value;
        Accounts.forgotPassword({
            email: email
        }, function(error) {
            if (error) {
              RavenClient.captureException(error);
            	Bert.alert(error.reason, 'danger')
            } else {
                Bert.alert(TAPi18n.__('pages.authenticate.reset-password.reset-password-sent-message'), 'success')
            }
        });
        
        return false;
    },

});