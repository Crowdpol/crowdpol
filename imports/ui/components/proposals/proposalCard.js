import './proposalCard.html'
import "../../components/proposals/proposalCard.js"
import RavenClient from 'raven-js';
import { Tags } from '../../../api/tags/Tags.js'
import { Proposals } from '../../../api/proposals/Proposals.js'

Template.ProposalCard.onCreated(function () {
  var self = this;
  self.autorun(function(){
    //self.subscribe('votes.all');
  })
});
/*
Template.ProposalCard.onRendered(function () {
  let proposal = this.data.proposal;
  let hasCover = proposal.hasCover;
  if(typeof hasCover!='undefined'){
    if(hasCover){
      //console.log(proposal.coverURL);
      let element = this.find("[data-id]");
      //element.css("background-image",proposal.coverURL);
      element.style.background-image=proposal.coverURL;
      //return "style='background-image:"+this.proposal.coverURL+";'";
    }
  }else{
    console.log("hasCover is undefined");
  }
});
*/
Template.ProposalCard.helpers({
  proposalHasImage: function(proposal) {
    if(typeof proposal.hasCover != 'undefined'){
      return proposal.hasCover;
    }
    return false;
  },
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
  abstract: function(proposal){
    var language = TAPi18n.getLanguage();
    var translation = _.find(proposal.content, function(item){ return item.language == language});
    if (translation){
      return translation.abstract;
    }

  },
  canVote: function() {
    return Session.get("canVote");
  },
  proposalStage: function(proposal) {
    var stage = ''
    if(typeof proposal.stage != 'undefined'){
      stage = proposal.stage;
    }
    if(stage.length > 0){
      return stage.charAt(0).toUpperCase() + stage.slice(1);
    }
    return 'stage unknown';
  },
  proposalStatus: function(proposal) {
    var status = ''
    if(typeof proposal.status != 'undefined'){
      stage = proposal.status;
    }
    if(status.length > 0){
      return status.charAt(0).toUpperCase() + status.slice(1);
    }
    return 'stage unknown';
  },
  tags: function(proposal){
    return Tags.find({_id: {$in: proposal.tags},"authorized" : true});
  },
  userIsAuthor: function(proposalId) {
    var proposal = Proposals.findOne(proposalId);
    return proposal.authorId == Meteor.userId();
  },
  userIsCollaborator: function(proposal) {
    //check if anyone has been invited
    if(typeof proposal.invited != 'undefined'){
      let invitedArray = proposal.invited;
      if(invitedArray.indexOf(Meteor.userId()) > -1){
          console.log("user match");
          return true;
      }
    }
    return false;
  },
  userId: function(){
    console.log(Meteor.userId());
    return Meteor.userId();
  },
  yesPercentage: function(proposalId) {
    var yesCount = Votes.find({proposalId: proposalId, vote: 'yes'}).count();
    var totalCount = Votes.find({proposalId: proposalId}).count();
    if (totalCount > 0) {
      return yesCount + " (" + Math.round(yesCount/totalCount * 100) + "%)";
    } else {
      return 0;
    }
  },
 noPercentage: function(proposalId) {
    var noCount = Votes.find({proposalId: proposalId, vote: 'no'}).count();
    var totalCount = Votes.find({proposalId: proposalId}).count();
    if (totalCount > 0) {
      return noCount + " (" + Math.round(noCount/totalCount * 100) + "%)";
    } else {
      return 0;
    }
  },
  hasVotes: function(proposalId) {
    if (Votes.find({proposalId: proposalId}).count() > 0) {
      return true;
    }
  },
  isDraft: function(proposal) {
    if(proposal.stage == 'live'||proposal.status=='approved'){
      return false;
    }
    return true;
  }
});

Template.ProposalCard.events({
  'click .delete-proposal-button': function(event, template){
    event.preventDefault();
    var proposalId = event.target.dataset.proposalId;
    if (window.confirm(TAPi18n.__('pages.proposals.list.confirmDelete'))){
      Meteor.call('deleteProposal', proposalId, function(error){
        if (error){
          RavenClient.captureException(error);
          Bert.alert(error.reason, 'danger');
        } else {
          Bert.alert(TAPi18n.__('pages.proposals.list.deletedMessage'), 'success');
        }
      });
    }
  },
  'click .edit-proposal-button': function(event, template){
    event.preventDefault();
    var proposalId = event.target.dataset.proposalId;
    if(typeof proposalId != 'undefined'){
      FlowRouter.go('App.proposal.edit', {id: proposalId});
    }
  },
});
