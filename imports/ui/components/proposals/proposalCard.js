import './proposalCard.html'
import "../../components/proposals/proposalCard.js"
import { Proposals } from '../../../api/proposals/Proposals.js'

Template.ProposalCard.onCreated(function () {
  var self = this;
  self.autorun(function(){
    self.subscribe('votes.all');
  })
});

Template.ProposalCard.helpers({
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
  proposalStatus: function(proposal) {
    //console.log(proposal);
    return proposal.stage;;
    // If looking at public proposals, show open/closed
    if (Session.get('allProposals')){
      if (new Date(proposal.endDate) > new Date()){
        return 'Open';
      } else {
        return 'Closed';
      }
      // If looking at own proposals, show draft/submitted/live
    } else if (Session.get('myProposals')){
      var stage = proposal.stage;
      return stage.charAt(0).toUpperCase() + stage.slice(1);
    }

  },
  tags: function(proposal){
    return proposal.tags;
  },
  userIsAuthor: function(proposalId) {
    var proposal = Proposals.findOne(proposalId);
    return proposal.authorId == Meteor.userId();
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
    return proposal.stage == 'draft';
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
});