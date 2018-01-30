import './signInModal.html'

Template.SignInModal.events({
  'click #overlay' (event, template){
    closeSignInModal();
  },
});

 openSignInModal = function(event) {
  if (event) event.preventDefault();
  $(".fab").addClass('active');
  $("#overlay").addClass('dark-overlay');

}

closeSignInModal = function(event) {
  if (event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  $(".fab").removeClass('active');
  $("#overlay").removeClass('dark-overlay');
  
}