import "./resetPassword.html"
import RavenClient from 'raven-js';

Template.ResetPassword.onRendered(function(){
	$("#reset-button").prop('disabled', true);
});
Template.ResetPassword.onCreated(function() {});
Template.ResetPassword.events({
	'submit #password-reset-form'(event,template) {
    // Prevent default browser form submit
    event.preventDefault();
    // Get value from form element
    var newPassword = template.find('[name="new-password"]');
    var oldPassword = template.find('[name="old-password"]');
    var confirmPassword = template.find('[name="confirm-password"]');
    //Meteor.call('resetPassword', oldPassword,newPassword, function(error){
    Accounts.changePassword(oldPassword.value, newPassword.value, function(error,result){
			if (error){
          RavenClient.captureException(error);
          if(error.error==403){
          	Bert.alert(TAPi18n.__('pages.profile.alerts.password-incorrect'), 'danger');
          }else{
          	Bert.alert(error.reason, 'danger');
          }
			} else {
         Bert.alert(TAPi18n.__('pages.profile.alerts.password-reset'), 'success');
         newPassword.value = '';
         oldPassword.value = '';
         confirmPassword.value = '';
			}
		});
  },
  'keyup #confirm-password, #new-password' (event,template){
    checkPasswordsMatch(template);
  },
  'blur #new-password, #confirm-password' (event,template){
    checkPasswordsMatch(template);
  },
  'click .toggle-password'(event,template) {
    var element= event.currentTarget;
    var elementId = "#" + element.id;
    $(elementId).toggleClass("fa-eye fa-eye-slash");
    var input = element.getAttribute('toggle');
    if ($(input).attr("type") == "password") {
      $(input).attr("type", "text");
    } else {
      $(input).attr("type", "password");
    }
  }
});
Template.ResetPassword.helpers({});

function checkPasswordsMatch(template){
  var newPassword = template.find('[name="new-password"]');
  var confirmPassword = template.find('[name="confirm-password"]');
  if (newPassword.value != confirmPassword.value) {
    $("#confirm-wrap").addClass("is-invalid");
    $("#reset-button").prop('disabled', true);
    return false;
  } else {
    // input is valid -- reset the error message
    $("#confirm-wrap").removeClass("is-invalid");
    $("#reset-button").prop('disabled', false);
    return true;
  }
}