import './proposals.html';
import { Comments } from '../../../../api/comments/Comments.js'
import { Proposals } from '../../../../api/proposals/Proposals.js'
import RavenClient from 'raven-js';
import { Tags } from '../../../../api/tags/Tags.js'

Template.AdminProposals.onCreated(function() {
  var self = this;
  var communityId = LocalStore.get('communityId')
  self.autorun(function() {
    self.subscribe('proposals.community', communityId);
    self.subscribe('users.admin');
    self.subscribe('tags.community', communityId);
  });
});

Template.AdminProposals.helpers({
  submittedProposals: function() {
    let submittedProposals = Proposals.find({stage: "submitted", status: "unreviewed"});
    return submittedProposals;
  },
  liveProposals: function() {
    let liveProposals = Proposals.find({stage: "live"});
    return liveProposals;
  },
  allProposals: function() {
    let allProposals = Proposals.find();
    return allProposals;
  },
});

Template.AdminProposals.events({

});

Template.AdminProposal.onCreated(function() {

});

Template.AdminProposal.helpers({
  title: function(proposal) {
    var language = TAPi18n.getLanguage();
    var translation = _.find(proposal.content, function(item){ return item.language == language});
    if (translation) {
      var title = translation.title;
      if (title && /\S/.test(title)) {
        return title;
      } else {
        return TAPi18n.__('pages.proposals.list.untitled')
      }
    } else {
      return TAPi18n.__('pages.proposals.list.untranslated')
    }
  },
  author: function(id) {
    let proposal = this.proposal;
    let authorId = proposal.authorId;
    var author = Meteor.users.findOne({ "_id" : authorId});
    if(typeof author!=='undefined'){
      if(author.profile.firstName==null){
      	return author.profile.username;
      }
      return author.profile.firstName + " " + author.profile.lastName + " (" + author.profile.username + ")";
    }
    return "error finding name";
  },
  lastModified: function(){
    return moment(this.lastModified).format('MMMM Do YYYY');
  },
  contributerCount: function(proposal){
    //return proposal.invited.length;
  }
});

Template.AdminProposal.events({
  'click .delete-proposal': function(event, template){
    if (window.confirm('Are you sure you want to delete this proposal?')){
  		proposalId = event.target.dataset.id;

      Meteor.call('deleteProposal',proposalId, function(error){
        if (error){
          RavenClient.captureException(error);
          Bert.alert(error.reason, 'danger');
        } else {
          // Create notification
          /*
          var message = TAPi18n.__('notifications.proposals.approved');
          var url = '/proposals/view/' + proposalId;
          Meteor.call('createNotification', {message: message, userId: Meteor.userId(), url: url, icon: 'check'});
          */
          Bert.alert("Proposal deleted", 'success');
        }
      });
    }
  },
	'click .preview-proposal': function(event, template){
		proposalId = event.target.dataset.id;
    proposalType = event.target.dataset.type;
    if(proposalType=='submitted'){
      Session.set("showApproval",true);
    }else{
      Session.set("showApproval",false);
    }
		proposal = Proposals.findOne({_id: proposalId});
		Session.set("proposal",proposal);

		openProposalModal();
		/*
		Meteor.call('rejectProposal', proposalId,function(error){
			if (error){
				RavenClient.captureException(error);
				Bert.alert(error.reason, 'danger');
			} else {
				var message = TAPi18n.__('notifications.proposals.rejected');
      			var url = '/proposals/view/' + proposalId;
      			Meteor.call('createNotification', {message: message, userId: Meteor.userId(), url: url, icon: 'do_not_disturb'})
				Bert.alert(TAPi18n.__('admin.alerts.proposal-rejected'), 'success');
			}
		});
		*/
	},
});

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
    Meteor.call('approveProposal', proposalId, function(error){
      if (error){
        RavenClient.captureException(error);
        Bert.alert(error.reason, 'danger');
      } else {
        // Create notification
        var message = TAPi18n.__('notifications.proposals.approved');
        var reason = $('#admin-comment').val();
        if(reason.length){
          var comment = {
            message: reason,
            proposalId: proposalId,
            authorId: Meteor.user()._id,
            type: 'admin'
          }
          Meteor.call('comment', comment);
        }
        var url = '/proposals/view/' + proposalId;
        Meteor.call('createNotification', {message: message, userId: Meteor.userId(), url: url, icon: 'check'});
        Bert.alert(TAPi18n.__('admin.alerts.proposal-approved'), 'success');
        closeProposalModal();
      }
    });
  },
  'click #reject-button': function(event, template){
    event.preventDefault();
    proposalId = Session.get("proposal")._id;
    Meteor.call('rejectProposal', proposalId,function(error){
      if (error){
        RavenClient.captureException(error);
        Bert.alert(error.reason, 'danger');
      } else {
        var reason = $('#admin-comment').val();
        if(reason.length){
          var comment = {
            message: reason,
            proposalId: proposalId,
            authorId: Meteor.user()._id,
            type: 'admin'
          }
          Meteor.call('comment', comment);
        }
        var message = TAPi18n.__('notifications.proposals.rejected');
        var url = '/proposals/view/' + proposalId;
        Meteor.call('createNotification', {message: message, userId: Meteor.userId(), url: url, icon: 'do_not_disturb'})
        Bert.alert(TAPi18n.__('admin.alerts.proposal-rejected'), 'success');
        closeProposalModal();
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

openProposalModal = function(event) {
  if (event) event.preventDefault();
  $(".proposal-modal").addClass('active');
  $("#overlay").addClass('dark-overlay');
}

closeProposalModal = function(event) {
  if (event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
  Session.set("showApproval",false);
  $(".proposal-modal").removeClass('active');
  $("#overlay").removeClass('dark-overlay');
  Session.set("proposal",false);
}
