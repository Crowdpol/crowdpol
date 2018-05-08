import './termsModal.html'

Template.TermsModal.events({
  'click #overlay' (event, template){
    closeTermsModal();
  },
  'click #accept-button' (event, template){
    event.preventDefault();
    Meteor.call('acceptTerms', function(error) {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        document.querySelector('#terms-checkbox-label').MaterialCheckbox.check();
        closeTermsModal();
      }
    })
  }
});

openTermsModal = function(event) {
  if (event) event.preventDefault();
  $(".terms-modal").addClass('active');
  $("#overlay").addClass('dark-overlay');
}

closeTermsModal = function(event) {
  if (event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  $(".terms-modal").removeClass('active');
  $("#overlay").removeClass('dark-overlay');
}