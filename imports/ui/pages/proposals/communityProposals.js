import { Proposals } from '../../../api/proposals/Proposals.js';
import { Votes } from '../../../api/votes/Votes.js'
import { timeRemaining } from '../../../utils/functions';
import './communityProposalList.html'

Template.CommunityProposalList.onCreated(function(){
  this.communityId = () => this.data.communityId;
  this.searchQuery = new ReactiveVar();
  this.autorun(() => {
    //this.subscribe('proposals.all.public', this.searchQuery.get());
    this.subscribe('proposals.all');
  });
  /*
  self.searchQuery = new ReactiveVar();
  self.communityId = new ReactiveVar(this.data.communityId);
  self.autorun(function(){
    console.log("about to run subscription: " + self.communityId.get());
    self.subscribe('proposals.public', self.searchQuery.get(), self.communityId.get());
  });

  self = this;
  //Local Storage
  var communityId = LocalStore.get('communityId');
  //Session variables
  Session.set('variableName','variableValue');
  //Reactive Variables
  self.reactiveVariable = new ReactiveVar([]);
  self.reactiveVariable.set("exampleData");
  //Reactive Dictionary
  var dict = new ReactiveDict();
  this.templateDictionary = dict;
  dict.set("communityId",LocalStore.get('communityId'));
  //subscriptions
  self.autorun(function() {
    self.subscribe("simpleSearch",Session.get('searchPhrase'),"delegate", communityId);
  });
  */
});

Template.CommunityProposalList.onRendered(function(){

});

Template.CommunityProposalList.events({
  /*
	'keyup #some-id': function(event, template){
		Session.set('searchPhrase',event.target.value);
	},
  'click .some-class': function(event, template){
    var communityId = Template.instance().templateDictionary.get( 'communityId' );
    delegateId = this._id;
    var ranks = Session.get('ranked');
    let settings = LocalStore.get('settings');
    let delegateLimit = -1;

    if(typeof settings != 'undefined'){
      //do something
    }
    Meteor.call('someMethod', someParameter, function(error, result){
      if(error) {
        RavenClient.captureException(error);
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert(TAPi18n.__('pages.delegates.alerts.ranking-updated'), 'success');
      }
    });
  },
  */
});

Template.CommunityProposalList.helpers({
	reactiveCommunityId: function(){

    return "will update soon";
  },
  proposalCount: function(){
    let communityId = Template.instance().data.communityId;
    return Proposals.find({"communityId":communityId}).count();
  },
  openProposals: function(isVotingAsDelegate){
    var communityId = LocalStore.get('communityId');
    let now = moment().toDate();//new Date();
    let end = now;
    //TO DO: add option for admin to select delgate expiry date (currently 14 days before end date)
    if(isVotingAsDelegate){
      end =  moment(now).subtract(2, 'weeks').toDate();//now.setDate(now.getDate()-14).toString();
    }
    return Proposals.find({stage: "live",communityId:LocalStore.get('communityId')}, {sort: {endDate: 1,createdAt:-1}},{transform: transformProposal});
  }
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
  return proposal;
};
