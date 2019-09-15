import './proposalModal.html';
import { Comments } from '../../../api/comments/Comments.js'
import { Proposals } from '../../../api/proposals/Proposals.js'
import RavenClient from 'raven-js';
import { Tags } from '../../../api/tags/Tags.js'

/* ----------------------------------- PROPOSAL MODAL ------------------------------------ */

Template.ProposalModal.onCreated(function(language){
  //this.autorun(function() {
    //this.subscribe('comments.all');
    //this.subscribe('users.admin');
  //});

});

Template.ProposalModal.events({
  'click #overlay' (event, template){
    closeProposalModal();
  },
  'click #approve-button': function(event, template){
    event.preventDefault();
    proposalId = Session.get("proposal")._id;
    var comment = {
      message: "No reason given",
      proposalId: proposalId,
      authorId: Meteor.user()._id,
      type: 'admin'
    }
    var reason = $('#admin-comment').val();
    if(reason.length){
      comment.message = reason;
    }
    let commentId = null;
    Meteor.call('comment',comment,function(error,result){
      if (error){
        RavenClient.captureException(error);
        Bert.alert(error.reason, 'danger');
      } else {
        commentId = result;
        if(commentId){
          Meteor.call('approveProposal', proposalId,commentId, function(error){
            if (error){
              RavenClient.captureException(error);
              Bert.alert(error.reason, 'danger');
            } else {
              // Create notification
              var message = TAPi18n.__('notifications.proposals.approved');
              var url = '/proposals/view/' + proposalId;
              Meteor.call('createNotification', {message: message, userId: Meteor.userId(), url: url, icon: 'check'});
              Bert.alert(TAPi18n.__('admin.alerts.proposal-approved'), 'success');
              closeProposalModal();
            }
          });
        }
      }
    });
  },
  'click #reject-button': function(event, template){
    event.preventDefault();
    proposalId = Session.get("proposal")._id;
    var comment = {
      message: "No reason given",
      proposalId: proposalId,
      authorId: Meteor.user()._id,
      type: 'admin'
    }
    var reason = $('#admin-comment').val();
    if(reason.length){
      comment.message = reason;
    }
    let commentId = null;
    Meteor.call('comment',comment,function(error,result){
      if (error){
        RavenClient.captureException(error);
        Bert.alert(error.reason, 'danger');
      } else {
        commentId = result;
        if(commentId){
          Meteor.call('rejectProposal', proposalId,commentId,function(error){
            if (error){
              RavenClient.captureException(error);
              Bert.alert(error.reason, 'danger');
            } else {
              var message = TAPi18n.__('notifications.proposals.rejected');
              var url = '/proposals/view/' + proposalId;
              Meteor.call('createNotification', {message: message, userId: Meteor.userId(), url: url, icon: 'do_not_disturb'})
              Bert.alert(TAPi18n.__('admin.alerts.proposal-rejected'), 'success');
              closeProposalModal();
            }
          });
        }
      }
    });
  },
  'click #return-button': function(event, template){
    event.preventDefault();
    proposalId = Session.get("proposal")._id;
    var comment = {
      message: "No reason given",
      proposalId: proposalId,
      authorId: Meteor.user()._id,
      type: 'admin'
    }
    var reason = $('#admin-comment').val();
    if(reason.length){
      comment.message = reason;
    }
    let commentId = null;
    Meteor.call('comment',comment,function(error,result){
      if (error){
        RavenClient.captureException(error);
        Bert.alert(error.reason, 'danger');
      } else {
        commentId = result;
        if(commentId){
          Meteor.call('returnProposal', proposalId,commentId,function(error){
            if (error){
              RavenClient.captureException(error);
              Bert.alert(error.reason, 'danger');
            } else {
              var message = TAPi18n.__('notifications.proposals.returned');
              var url = '/proposals/view/' + proposalId;
              Meteor.call('createNotification', {message: message, userId: Meteor.userId(), url: url, icon: 'do_not_disturb'})
              Bert.alert(TAPi18n.__('admin.alerts.proposal-returned'), 'success');
              closeProposalModal();
            }
          });
        }
      }
    });
  },
});

Template.ProposalModal.helpers({
	proposalId: function(){
		let proposal = Session.get("proposal");
    if(proposal){
      return proposal._id;
    }
    return false;
	},
  showApproval: function(){
    return Session.get("showApproval");
  }
});

export function openProposalModal(event) {
  if (event) event.preventDefault();
  $(".proposal-modal").addClass('active');
  $("#overlay").addClass('dark-overlay');
  Session.set("adminProposalView",true);
}

export function closeProposalModal(event) {
  if (event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
  Session.set("showApproval",false);
  $(".proposal-modal").removeClass('active');
  $("#overlay").removeClass('dark-overlay');
  Session.set("proposal",false);
  Session.set("adminProposalView",false);
}
