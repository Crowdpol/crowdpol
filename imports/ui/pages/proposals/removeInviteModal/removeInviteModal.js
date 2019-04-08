import './removeInviteModal.html'

Template.RemoveInviteModal.events({
  'click #overlay, click #reject-cancel-button' (event, template){
    closeRemoveInviteModal();
  },
  'click #reject-approve-button' (event, template){
    event.preventDefault();
    //capture generic comment for feedback to invitee
    var reason = "Invitation to collaborate declined.";
    //check if user added an additional comment and capture
    var reasonInput = $('#reject-invite-reason').val();
    if(reason.length){
      reason = reason + " Reason given: " + reasonInput;
    }
    let proposalId = event.currentTarget.getAttribute("data-proposal-id");
    console.log("proposalId: " + proposalId);
    //log comment
    var comment = {
      message: reason,
      proposalId: proposalId,
      authorId: Meteor.user()._id,
      type: 'invite-rejection'
    }
    Meteor.call('comment', comment);
    //remove invited person from proposal
    proposalId = FlowRouter.getParam("id");
    Meteor.call('removeInvitation',Meteor.userId(),proposalId, function(error){
      if (error){
        RavenClient.captureException(error);
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert(TAPi18n.__('pages.proposals.view.alerts.invitationRemoved'), 'success');
        FlowRouter.go('App.proposals');
      }
    });
    closeTermsModal();
  }
});

openRemoveInviteModal = function(event) {
  if (event) event.preventDefault();
  $(".remove-invite-modal").addClass('active');
  $("#overlay").addClass('dark-overlay');
}

closeRemoveInviteModal = function(event) {
  if (event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  $(".remove-invite-modal").removeClass('active');
  $("#overlay").removeClass('dark-overlay');
}
