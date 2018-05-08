import './voting.html'
import { Proposals } from '../../../api/proposals/Proposals.js'
import { Votes } from '../../../api/votes/Votes.js'

Template.Voting.onCreated(function () {
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
    self.subscribe('proposals.invited', Meteor.user().username, self.searchQuery.get(), communityId);
  })
});

Template.Voting.helpers({
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
    return Proposals.find({authorId: Meteor.userId()}, {transform: transformProposal, sort: {createdAt: -1}});
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
  isVotingAsDelegate: function(){
    return (LocalStore.get('currentUserRole') == 'Delegate');
  },
});

Template.Voting.events({
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
  proposal.endDate = moment(proposal.endDate).format('YYYY-MM-DD');
  return proposal;
};

Template.VotingCard.onCreated(function () {
  var self = this;
  self.showVotingInfo = new ReactiveVar(false);
  self.autorun(function(){
    self.subscribe('votes.all');
  })
});

Template.VotingCard.helpers({
  title: function(proposal) {
    var language = TAPi18n.getLanguage();
    var translation = _.find(proposal.content, function(item){ return item.language == language});
    return translation.title;
  },
  abstract: function(proposal){
    var language = TAPi18n.getLanguage();
    var translation = _.find(proposal.content, function(item){ return item.language == language});
    return translation.abstract;
  },
  isVotingAsDelegate: function(){
    return (LocalStore.get('currentUserRole') == 'Delegate');
  },
  showVotingInfo: function() {
    return Template.instance().showVotingInfo.get();
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
  hasVotes: function(proposalId) {
    if (Votes.find({proposalId: proposalId}).count() > 0) {
      return true;
    }
  }
});

Template.VotingCard.events({
  'click #toggle-voting-info': function(event, template){
     var showVotingInfo = template.showVotingInfo.get();
     template.showVotingInfo.set(!showVotingInfo);
     console.log(template.showVotingInfo.get())
  },
});