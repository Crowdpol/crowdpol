import './proposals.html';
import { Comments } from '../../../../api/comments/Comments.js'
import { Proposals } from '../../../../api/proposals/Proposals.js'
import RavenClient from 'raven-js';

Template.AdminProposals.onCreated(function() {
  var self = this;
  var communityId = LocalStore.get('communityId')
  self.autorun(function() {
    self.subscribe('proposals.community', communityId);
  });
});

Template.AdminProposals.helpers({
  submittedProposals: function() {
    let submittedProposals = Proposals.find({stage: "submitted", status: "unreviewed"});
    return submittedProposals;
  },
  liveProposals: function() {
    let liveProposals = Proposals.find({stage: "live"});
    //console.log("liveProposals: " + liveProposals.count());
    return liveProposals;
  },
  allProposals: function() {
    let allProposals = Proposals.find();
    //console.log("allProposals: " + allProposals.count());
    return allProposals;
  },
});

Template.AdminProposals.events({

});

Template.AdminProposal.onCreated(function() {

});

Template.AdminProposal.helpers({
  title: function(proposal) {
    //console.log(proposal);
    var language = TAPi18n.getLanguage();
    //console.log(language);
    //console.log(this.content);
    var translation = _.find(proposal.content, function(item){ return item.language == language});
    //console.log(translation);
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

  	var author = Meteor.users.findOne({ _id : id});
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
    //console.log(proposal)
    //return proposal.invited.length;
  }
});

Template.AdminProposal.events({
  'click .delete-proposal': function(event, template){

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
        var message = TAPi18n.__('notifications.proposals.rejected');
            var url = '/proposals/view/' + proposalId;
            Meteor.call('createNotification', {message: message, userId: Meteor.userId(), url: url, icon: 'do_not_disturb'})
        Bert.alert(TAPi18n.__('admin.alerts.proposal-rejected'), 'success');
        closeProposalModal();
      }
    });
  },
});
Template.ProposalModal.onCreated(function(language){

});
Template.ProposalModal.helpers({
	proposal: function(){
		return Session.get("proposal");
	},
	content: function(){
		proposal = Session.get("proposal");
		content = proposal.content;
		return content;
	},
  author: function(){
    proposal = Session.get("proposal");
    return Meteor.users.findOne({ _id : proposal.authorId});
  },
  selectedInvites: function() {
    proposal = Session.get("proposal");
    var invited = proposal.invited;
    if (invited) {
      collaborators = Meteor.users.find({ _id : { $in : invited } });
      return collaborators;
    }
  },
  languages: function() {
    proposal = Session.get("proposal");
    content = proposal.content;
    var languages = _.pluck(content, 'language');
    return languages;
  },
  activeClass: function(language){
    var currentLang = TAPi18n.getLanguage();
    if (language == currentLang){
      return 'is-active';
    }
  },
  tags: function() {
    proposal = Session.get("proposal");
    return proposal.tags;
  },
  comments: function() {
    return Comments.find({proposalId: proposalId},{transform: transformComment, sort: {createdAt: -1}});
  },
  commentUsername: function(userId){
    Meteor.call('getProfile', userId, function(error, result){
      if (error){
        return TAPi18n.__('pages.proposals.view.userNotFound');
      } else {
        profile = result.profile;
        if (profile){
          return profile.username;
        } else {
          return TAPi18n.__('pages.proposals.view.anonymous');
        }
      }
    });
  },
  _id: function() {
    return Session.get("proposalId");
  },
  propDate:function(lastModified){
    return moment(lastModified).format('MMMM Do YYYY');
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
}
