import './termsModal.html'

Template.TermsModal.events({
  'click #overlay' (event, template){
    closeTermsModal();
  },
  'click #decline-button' (event, template){
    event.preventDefault();
    $('.terms-checkbox').prop('checked', false);
		$('#entity-terms').prop('checked', false);
		$('#individual-terms').prop('checked', false);
    Session.set('termsAccepted', false);
    closeTermsModal();
  },
  'click #accept-button' (event, template){
    event.preventDefault();
    $('.terms-checkbox').prop('checked', true);
		$('#entity-terms').prop('checked', true);
		$('#individual-terms').prop('checked', true);
    Session.set('termsAccepted', true);
    closeTermsModal();
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
