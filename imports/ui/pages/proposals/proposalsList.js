import './proposalsList.html'
import "../../components/proposals/proposalCard.js"
import { Proposals } from '../../../api/proposals/Proposals.js'
import { Votes } from '../../../api/votes/Votes.js'
import RavenClient from 'raven-js';
import { walkThrough } from '../../../utils/functions';

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
  var propTab = Session.get("proposalTab");
  if(propTab == null||propTab ==''){
    Session.set('proposalTab','vote-proposals-tab');
  }
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
  'click #all-proposals-help'(event, template){
    var steps = [
      {
        element: '.search-wrapper',
        intro: "Search for any keyword in the list of proposals.",
        position: 'bottom'
      },
      {
        element: '#vote-proposals-tab',
        intro: "Click here to see all available proposals.",
        position: 'bottom'
      },
      {
        element: '#my-proposals-tab',
        intro: "Click here to see all of the proposals you have authored.",
        position: 'bottom'
      },
      {
        element: "#create-proposal-tab",
        intro: "Create a new proposal",
        position: 'bottom'
      }
    ];
    walkThrough(steps);
  },
  'click #my-proposals-help'(event, template){
    var steps = [
      {
        element: '.search-wrapper',
        intro: "Search for any keyword in the list of proposals.",
        position: 'bottom'
      },
      {
        element: '#vote-proposals-tab',
        intro: "Click here to see all available proposals.",
        position: 'bottom'
      },
      {
        element: '#my-proposals-tab',
        intro: "Click here to see all of the proposals you have authored.",
        position: 'bottom'
      },
      {
        element: "#create-proposal-tab",
        intro: "Create a new proposal",
        position: 'bottom'
      }
    ];
    walkThrough(steps);
  },
  'click #open-proposals-help, click #closed-proposals-help'(event, template){
    var steps = [
      {
        element: '.search-wrapper',
        intro: "Search for any keyword in the list of proposals.",
        position: 'bottom'
      },
      {
        element: '#vote-proposals-tab',
        intro: "Click here to see all available proposals.",
        position: 'bottom'
      },
      {
        element: '#my-proposals-tab',
        intro: "Click here to see all of the proposals you have authored.",
        position: 'bottom'
      },
      {
        element: "#create-proposal-tab",
        intro: "Create a new proposal",
        position: 'bottom'
      },
      {
        element: '.switch-wrap',
        intro: "Switch between open and closed proposals.",
        position: 'bottom'
      },
      {
        element: '.proposal-item mdl-list__item',
        intro: "Click proposal summary to view full proposal.",
        position: 'bottom'
      }
      
    ];
    walkThrough(steps);
  }
});

function transformProposal(proposal) { 
  proposal.endDate = moment(proposal.endDate).format('MMMM Do YYYY');
  proposal.startDate = moment(proposal.startDate).format('MMMM Do YYYY');
  proposal.lastModified = moment(proposal.lastModified).fromNow();
  return proposal;
};

