import './newPassword.html'

Template.newPassword.onRendered( function() {
  $( "#new-password" ).validate({
    rules: {
      'new-password-password': {
        required: true,
        minlength: 6
      },
    },
    messages: {
      'new-password-password': {
        required: 'Please enter your new password.',
        minlength: 'Your password must be at least 6 characters long.'
      },
    }
  });
});

Template.newPassword.events({
    'submit #new-password': function(event, template) {
        event.preventDefault();
        var password = template.find('[name="new-password-password"]').value;
        Accounts.resetPassword(Accounts._resetPasswordToken, password, function(error) {
            if (error) {
            	Bert.alert(error.reason, 'danger');
            } else {
                Bert.alert(TAPi18n.__('password-changed'), 'success');
                FlowRouter.go('App.dash');
            }
        });
        
        return false;
    }
});