import './proposalsList.html'
import "../../components/proposals/proposalCard.js"
import { Proposals } from '../../../api/proposals/Proposals.js'
import { Votes } from '../../../api/votes/Votes.js'
import RavenClient from 'raven-js';
import { walkThrough } from '../../../utils/functions';

Template.ProposalsList.onCreated(function () {
  var self = this;

  self.searchQuery = new ReactiveVar();
  self.approvedProposals = new ReactiveVar(true);
  self.authorProposals = new ReactiveVar(true);
  // Indicate active tab
  Session.set("draftProposals",true);
  Session.set("submittedProposals",false);
  Session.set('back','/proposals');
  var propTab = Session.get("proposalTab");
  if(propTab == null||propTab ==''){
    Session.set('proposalTab','draft-proposals-tab');
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
  myProposals: function(){
    return Proposals.find({authorId: Meteor.userId(), stage : "draft"}, {transform: transformProposal, sort: {createdAt: -1}});
  },
  invitedProposals: function(){
    return Proposals.find({invited: Meteor.user().username, stage : "draft"}, {transform: transformProposal, sort: {createdAt: -1}});
  },
  approvedProposals: function() {
    return Proposals.find({$or: [{authorId: Meteor.userId()}, {invited: Meteor.userId()} ], status: "approved"}, {transform: transformProposal, sort: {endDate: -1}});
  },
  rejectedProposals: function() {
    return Proposals.find({$or: [{authorId: Meteor.userId()}, {invited: Meteor.userId()} ], status: "rejected"}, {transform: transformProposal, sort: {endDate: -1}});
  },
  /*
  closedProposals: function() {
    return Proposals.find({endDate:{"$lte": new Date()}, stage: "live"}, {transform: transformProposal, sort: {endDate: -1}});
  },
  
  openProposals: function() {
    return Proposals.find({$or: [{authorId: Meteor.userId()}, {invited: Meteor.userId()} ],endDate:{"$gte": new Date()}, stage: "live"}, {transform: transformProposal, sort: {endDate: -1}});
  },
  myProposals: function(){
    return Proposals.find({$or: [{authorId: Meteor.userId()}, {invited: Meteor.userId()} ]}, {transform: transformProposal, sort: {createdAt: -1}});
  },
  */
  
  approvedSelected: function(){
    return Template.instance().approvedProposals.get();
  },
  /*
  openSelected: function(){
    return Template.instance().openProposals.get();
  },*/
  authorSelected: function(){
    return Template.instance().authorProposals.get();
  },
  draftTabActive: function(){
    if(Session.get("proposalTab")=='draft-proposals-tab'){
      Session.set("draftProposals",true);
      Session.set("submittedProposals",false);
      return true;
    }
    return false;
  },
  submittedTabActive: function(){
    if(Session.get("proposalTab")=='submitted-proposals-tab'){
      Session.set("draftProposals",false);
      Session.set("submittedProposals",true);
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
  'click #approved-rejected-switch': function(event, template){
    Template.instance().approvedProposals.set(event.target.checked);
  },
  'click #author-invited-switch': function(event, template){
    Template.instance().authorProposals.set(event.target.checked);
  },
  'click #my-proposals-tab': function(event, template){
    Session.set("myProposals",true);
    Session.set("allProposals",false);
  },
  'click #submitted-proposals-tab': function(event, template){
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
        element: '#draft-proposals-tab',
        intro: "Click here to see all available proposals.",
        position: 'bottom'
      },
      {
        element: '#submitted-proposals-tab',
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

