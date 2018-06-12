import './proposalsList.html'
import "../../components/proposals/proposalCard.js"
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
  Session.set('back','/proposals');
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
  },
  votesTabActive: function(){
    if(Session.get("proposalTab")=='vote-proposals-tab'){
      Session.set("canVote",Template.instance().openProposals.get());
      Session.set("myProposals",false);
      Session.set("allProposals",true);
      return true;
    }
    return false;
  },
  myTabActive: function(){
    if(Session.get("proposalTab")=='my-proposals-tab'){
      Session.set("canVote",false);
      Session.set("myProposals",true);
      Session.set("allProposals",false);
      return true;
    }
    return false;
  }
});

Template.ProposalsList.events({
  'keyup #proposal-search' ( event, template ) {
    let value = event.target.value.trim();
    template.searchQuery.set(value);
  },
	'click #add-new-proposal, click #new-proposals-link, click #create-proposal': function(event, template){
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
  'click .mdl-tabs__tab': function(event,template){ 
    if(event.currentTarget.id!='create-proposal-tab'){
      Session.set("proposalTab",event.currentTarget.id);
    }
  },
});

function transformProposal(proposal) { 
  proposal.endDate = moment(proposal.endDate).format('MMMM Do YYYY');
  proposal.startDate = moment(proposal.startDate).format('MMMM Do YYYY');
  proposal.lastModified = moment(proposal.lastModified).fromNow();
  return proposal;
};

