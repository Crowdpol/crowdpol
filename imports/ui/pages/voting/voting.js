import './voting.html'
import { Proposals } from '../../../api/proposals/Proposals.js'
import { Votes } from '../../../api/votes/Votes.js'
import { timeRemaining } from '../../../utils/functions';

Template.Voting.onCreated(function () {
  var self = this;

  self.searchQuery = new ReactiveVar();
  self.openProposals = new ReactiveVar(true);
  self.authorProposals = new ReactiveVar(true);
  Session.set("canVote",true);
  // Indicate active tab
  if(!Session.get("activeVoteTab")){
    Session.set("activeVoteTab","vote");
  }
  Session.set("votesTab",true);
  Session.set("completedTab",false);
  var communityId = LocalStore.get('communityId');

  self.autorun(function(){
    self.subscribe('proposals.public', self.searchQuery.get(), communityId);
    self.subscribe('proposals.author', self.searchQuery.get(), communityId);
    //self.subscribe('proposals.invited', Meteor.user().username, self.searchQuery.get(), communityId);
    self.subscribe('proposals.invited', self.searchQuery.get(), communityId);
  })
});

Template.Voting.helpers({
  searching() {
    return Template.instance().searching.get();
  },
  query() {
    return Template.instance().searchQuery.get();
  },
  votesTabActive(){
    if(Session.get("activeVoteTab")=="vote"){
      return "is-active"
    }
    return null;
  },
  completedTabActive(){
    if(Session.get("activeVoteTab")=="closed"){
      return "is-active"
    }
    return null;
  },
  closedProposals: function() {
    return Proposals.find({endDate:{"$lte": new Date()}, stage: "live"}, {transform: transformProposal, sort: {endDate: 1}});
  },
  openProposals: function(isVotingAsDelegate) {
    let now = moment().toDate();//new Date();
    let end = now;
    //TO DO: add option for admin to select delgate expiry date (currently 14 days before end date)
    if(isVotingAsDelegate){
      //console.log(now);
      end =  moment(now).subtract(2, 'weeks').toDate();//now.setDate(now.getDate()-14).toString();
      //console.log(end);
    }

    return Proposals.find({startDate:{"$lte": now}, endDate:{"$gte": end}, stage: "live"}, {transform: transformProposal, sort: {endDate: 1}});
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
  isVotingAsIndividual: function(){
    return (LocalStore.get('currentUserRole') == 'Individual');
  },
  userHasMultipleRoles(){
    var user = Meteor.user();
    var userRoles = user.roles;
    if (user && userRoles) {
      var roles = getMenuRoles(userRoles);
      return roles.length > 1;
    }
    return false;
  },
  roles(){
    var userRoles = Meteor.user().roles;
    var roles = getMenuRoles(userRoles);
    //Capitalise first letter of role name
    return _.map(roles, function(role){ return role.charAt(0).toUpperCase() + role.slice(1);; });
  },
  currentRole(){
    return LocalStore.get('currentUserRole');
  },
  isCurrentRole(role){
    return (role == LocalStore.get('currentUserRole'));
  },
  voteDropdownText(){
    var str = "layout.header.vote_as_" + LocalStore.get('currentUserRole').toLowerCase();
    return TAPi18n.__(str);
  }
});

Template.Voting.events({
  'keyup #vote-search' ( event, template ) {
    let value = event.target.value.trim();
    //console.log(value);
    template.searchQuery.set(value);
  },
  'click .role-menu-item' : function(){
    LocalStore.set('currentUserRole', event.target.dataset.role)
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
  'click #vote-proposals-tab': function(event, template){
    Session.set("activeVoteTab","vote");
  },
  'click #closed-proposals-tab': function(event, template){
    Session.set("activeVoteTab","closed");
  },
});

function transformProposal(proposal) {
  var currentLang = TAPi18n.getLanguage();
  var endDate = proposal.endDate;
  var startDate = proposal.startDate;
  //Put dates in ISO format so they are compatible with moment
  endDate = endDate.toISOString();
  startDate = startDate.toISOString();
  proposal.endDate = endDate;
  proposal.startDate = startDate;
  var content = proposal.content;
  content.forEach(function (lang, index) {
    if(lang.language==currentLang){

      //var langContent = {
        proposal.title = lang.title
        proposal.abstract =lang.abstract;
        proposal.body = lang.body;
        proposal.pointsAgainst = lang.pointsAgainst;
        proposal.pointsFor = lang.pointsFor;
      //}
      //proposal.langContent = langContent;
    }
  });
  //console.log(proposal);
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
    if (translation){
      return translation.title;
    } else {
      return TAPi18n.__('pages.proposals.list.untranslated')
    }
  },
  abstract: function(proposal){
    //console.log(proposal);
    var language = TAPi18n.getLanguage();
    var translation = _.find(proposal.content, function(item){ return item.language == language});
    if (translation){
      return translation.abstract;
    }
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
  expireDate: function(proposal){
    var endDate = proposal.endDate;
    endDate = moment(endDate).fromNow();
    return endDate;
  },
  tags: function(proposal){
    return proposal.tags;
  },
});

Template.VotingCard.events({
  'click #toggle-voting-info': function(event, template){
     var showVotingInfo = template.showVotingInfo.get();
     template.showVotingInfo.set(!showVotingInfo);
     //console.log(template.showVotingInfo.get())
  },
});

//VOTING RESULTS
Template.ResultCard.onCreated(function () {
  var self = this;
  self.showVotingInfo = new ReactiveVar(false);
  self.autorun(function(){
    self.subscribe('votes.all');
  })
});

Template.ResultCard.helpers({
  title: function(proposal) {
    var language = TAPi18n.getLanguage();
    var translation = _.find(proposal.content, function(item){ return item.language == language});
    if (translation){
      return translation.title;
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
  proposalStatus: function(proposal) {
    //console.log(proposal);
    /*
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
    }*/
    return "test"
  },
  tags: function(proposal){
    return proposal.tags;
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
  },
  userIsAuthor: function(proposalId) {
    var proposal = Proposals.findOne(proposalId);
    return proposal.authorId == Meteor.userId();
  },
  endDate: function(proposal){
    return proposal.endDate;
  },
  started: function(date){
    return moment(date).format('Do MMMM YYYY');
  },
  completed: function(date){
    return moment(date).format('Do MMMM YYYY');
  }
});

Template.ResultCard.events({
  'click #toggle-voting-info': function(event, template){
     var showVotingInfo = template.showVotingInfo.get();
     template.showVotingInfo.set(!showVotingInfo);
  },
});

function getMenuRoles(userRoles){
  var menuRoles = ['individual', 'delegate'];
  return _.intersection(userRoles, menuRoles);
}
