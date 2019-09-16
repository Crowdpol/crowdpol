import './userProposalList.html'
import "../../components/proposals/proposalCard.js"
import { Proposals } from '../../../api/proposals/Proposals.js'
import RavenClient from 'raven-js';

Template.UserProposalList.onCreated(function () {
  var self = this;
  self.searchQuery = new ReactiveVar();
  self.stage = new ReactiveVar(this.data.stage);
  Session.set('back','/proposals');
  var communityId = LocalStore.get('communityId');
  self.autorun(function(){
    self.subscribe('proposals.currentUser', self.searchQuery.get(), communityId);
  })
});

Template.UserProposalList.helpers({
  searching() {
    return Template.instance().searching.get();
  },
  query() {
    return Template.instance().searchQuery.get();
  },
  proposals: function(){
    return Proposals.find({$or: [{authorId: Meteor.userId()}, {invited: Meteor.userId()} ], stage : Template.instance().stage.get()}, {transform: transformProposal, sort: {createdAt: -1}});
  }
});

Template.UserProposalList.events({
  'keyup #proposal-search' ( event, template ) {
    let value = event.target.value.trim();
    template.searchQuery.set(value);
  },
});

function transformProposal(proposal) {
  proposal.endDate = moment(proposal.endDate).format('MMMM Do YYYY');
  proposal.startDate = moment(proposal.startDate).format('MMMM Do YYYY');
  proposal.lastModified = moment(proposal.lastModified).fromNow();
  return proposal;
};
