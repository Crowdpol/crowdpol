import './proposalsList.html'
import { Proposals } from '../../../api/proposals/Proposals.js'
import { Votes } from '../../../api/votes/Votes.js'
import RavenClient from 'raven-js';

Template.ProposalsList.onCreated(function () {
  var self = this;

  self.searchQuery = new ReactiveVar();
  self.openProposals = new ReactiveVar(true);
  self.authorProposals = new ReactiveVar(true);
  Session.set("canVote",true);
  // Indicate active tab
  Session.set("allProposals",true);
  Session.set("myProposals",false);
  var communityId = LocalStore.get('communityId');
  self.autorun(function(){
    self.subscribe('proposals.public', self.searchQuery.get(), communityId);
    self.subscribe('proposals.author', self.searchQuery.get(), communityId);
    self.subscribe('proposals.invited', self.searchQuery.get(), communityId);
  })
});

Template.ProposalsList.helpers({
  searching() {
    return Template.instance().searching.get();
  },
  query() {
    return Template.instance().searchQuery.get();
  },
  closedProposals: function() {
    return Proposals.find({endDate:{"$lte": new Date()}, stage: "live"}, {transform: transformProposal, sort: {endDate: -1}});
  },
  openProposals: function() {
    return Proposals.find({endDate:{"$gte": new Date()}, stage: "live"}, {transform: transformProposal, sort: {endDate: -1}});
  },
  myProposals: function(){
    return Proposals.find({$or: [{authorId: Meteor.userId()}, {invited: Meteor.userId()} ]}, {transform: transformProposal, sort: {createdAt: -1}});
  },
  invitedProposals: function(){
    return Proposals.find({invited: Meteor.user().username}, {transform: transformProposal, sort: {createdAt: -1}});
  },
  openSelected: function(){
    return Template.instance().openProposals.get();
  },
  authorSelected: function(){
    return Template.instance().authorProposals.get();
  }
});

Template.ProposalsList.events({
  'keyup #proposal-search' ( event, template ) {
    let value = event.target.value.trim();
    template.searchQuery.set(value);
  },
	'click #add-new-proposal, click #new-proposals-link': function(event, template){
    FlowRouter.go('App.proposal.edit', {id: ''});
	},
  'click #open-closed-switch': function(event, template){
    Session.set("canVote",event.target.checked);
    Template.instance().openProposals.set(event.target.checked);
  },
  'click #author-invited-switch': function(event, template){
    Template.instance().authorProposals.set(event.target.checked);
  },
  'click #my-proposals-tab': function(event, template){
    Session.set("canVote",false);
    Session.set("myProposals",true);
    Session.set("allProposals",false);
  },
  'click #vote-proposals-tab': function(event, template){
    Session.set("canVote",Template.instance().openProposals.get());
    Session.set("myProposals",false);
    Session.set("allProposals",true);
  },
});

function transformProposal(proposal) { 
  proposal.endDate = moment(proposal.endDate).format('MMMM Do YYYY');
  proposal.startDate = moment(proposal.startDate).format('MMMM Do YYYY');
  proposal.lastModified = moment(proposal.lastModified).fromNow();
  return proposal;
};

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
  userIsAuthor: function(proposalId) {
    var proposal = Proposals.findOne(proposalId);
    return proposal.authorId == Meteor.userId();
  },
  yesPercentage: function(proposalId) {
    var yesCount = Votes.find({proposalId: proposalId, vote: 'yes'}).count();
    var totalCount = Votes.find({proposalId: proposalId}).count();
    if (totalCount > 0) {
      return yesCount/totalCount * 100;
    } else {
      return 0;
    }
  },
 noPercentage: function(proposalId) {
    var yesCount = Votes.find({proposalId: proposalId, vote: 'no'}).count();
    var totalCount = Votes.find({proposalId: proposalId}).count();
    if (totalCount > 0) {
      return yesCount/totalCount * 100;
    } else {
      return 0;
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