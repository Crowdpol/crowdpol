import './newPassword.html'

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