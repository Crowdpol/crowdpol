import './signInModal.html'

Template.SignInModal.events({
  'click .fab' (event, template){
    openFAB(event, template);
  },
  'click #cancel' (event, template){
    closeFAB(event, template);
  },
  'click #overlay' (event, template){
    closeFAB(event, template);
  },
});

function openFAB(event, template) {
  if (event) event.preventDefault();
  $(".fab").addClass('active');
  $("#overlay").addClass('dark-overlay');

}

function closeFAB(event, template) {
  if (event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  $(".fab").removeClass('active');
  $("#overlay").removeClass('dark-overlay');
  
}