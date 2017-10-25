import './passwordRecovery.html'
Template.passwordRecovery.helpers({
    resetPassword: function(template) {
        return Session.get('resetPassword');
    }
});

Template.passwordRecovery.events({
    'submit #recover-password': function(event, template) {
        event.preventDefault()
        var email = template.find('[name="recovery-email"]').value;
        Accounts.forgotPassword({
            email: email
        }, function(error) {
            if (error) {
            	Bert.alert(error.reason, 'danger')
            } else {
                Bert.alert("reset-password-sent-message", 'success')
            }
        });
        
        return false;
    },

    'submit #new-password': function(event, template) {
        event.preventDefault();
        var password = template.find('[name="new-password-password"]').value;
        Accounts.resetPassword(Session.get('resetPassword'), password, function(err) {
            if (error) {
            	Bert.alert(error.reason, 'danger')
            } else {
                Bert.alert("password-changed", 'success')
            }
        });
        
        return false;
    }
});