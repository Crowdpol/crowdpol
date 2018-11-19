import { Meteor } from 'meteor/meteor';
import "./delegate.html"
import { Ranks } from '../../../api/ranking/Ranks.js'
import RavenClient from 'raven-js';
import { walkThrough } from '../../../utils/functions';

Template.Delegate.onCreated(function () {
  var communityId = LocalStore.get('communityId');
  Session.set('searchPhrase','');
  var dict = new ReactiveDict();
  this.templateDictionary = dict;
  dict.set("communityId",LocalStore.get('communityId'));

  var self = this;
  self.ranks = new ReactiveVar([]);

  self.autorun(function() {
    self.subscribe("simpleSearch",Session.get('searchPhrase'),"delegate", communityId);
    self.subscribe('ranks.all');
    // Set user's ranked delegates
    Meteor.call('getRanks', Meteor.userId(), "delegate", communityId, function(error, result){
      if(error) {
        RavenClient.captureException(error);
        Bert.alert(error.reason, 'danger');
      } else {
        Session.set('ranked', result);
        dict.set('ranked',result);
      }
    });
  });

});

Template.Delegate.onRendered(function () {
  $( "svg" ).delay( 750 ).fadeIn();
  Meteor.defer(function(){
    $( "#sortable" ).sortable({
      create: function( event, ui ) {
      }
    });
    $( "#sortable" ).disableSelection();

    $( "#sortable" ).on("sortchange", sortEventHandler);
  });

});

Template.Delegate.helpers({
  notDelegate: function() {
    if(Roles.userIsInRole(Meteor.user(), ['delegate'])){
      return false;
    }
    return true;
  },
  getRanking: function(template) {
    communityId = Template.instance().templateDictionary.get( 'communityId' );
    result = Ranks.findOne({entityType: 'delegate', entityId: this._id, supporterId: Meteor.userId(),communityId: communityId});
    if(result){
      return result.ranking;
    }
  },
  ranks: function() {
    return Meteor.users.find( { _id : { $in :  Session.get('ranked')} },{sort: ["ranking"]} );
  },
  delegates: function() {
    /* DO NOT SHOW CURRENT USER IN DELEGATE SEARCH
    delegates = Meteor.users.find( { $and: [
      { _id : { $nin : Session.get('ranked')}},
      { _id : { $ne: Meteor.userId()} }
    ]});
    */
    delegates = Meteor.users.find( { $and: [
      { _id : { $nin : Session.get('ranked')}}
    ]});
    return delegates;
  },
  searchPhrase: function() {
  	return Session.get('searchPhrase');
  }
});

Template.Delegate.events({
	'keyup #delegate-search': function(event, template){
		Session.set('searchPhrase',event.target.value);
	},
  'click .delegate-select': function(event, template){
    var communityId = Template.instance().templateDictionary.get( 'communityId' );
    delegateId = this._id;
    var ranks = Session.get('ranked');
    let settings = LocalStore.get('settings');
    let delegateLimit = -1;
    if(typeof settings != 'undefined'){
      if(typeof settings.delegateLimit != 'undefined'){
        delegateLimit = settings.delegateLimit;

      }else{
        console.log('settings.default not found');
      }
    }else{
      console.log('settings not found');
    }
    console.log('delegateLimit: ' + delegateLimit);
    if((delegateLimit==0)||(ranks.length>=delegateLimit)){
      Bert.alert(TAPi18n.__('pages.delegates.alerts.delegate-limit'), 'danger');
      event.target.checked = false;
    }else{
      Meteor.call('addRank','delegate',delegateId,(ranks.length +1),communityId,function(error,result){
        if (error) {
          RavenClient.captureException(error);
          Bert.alert(error.reason, 'danger');
        } else {
          Session.set('ranked',result);
        }
      });
   }
  },
  'click .rank-select': function(event, template){
    delegateId = this._id;
    communityId = Template.instance().templateDictionary.get( 'communityId' )
      Meteor.call('removeRank','delegate',delegateId,communityId,function(error,result){
        if (error) {
          RavenClient.captureException(error);
          Bert.alert(error.reason, 'danger');
        } else {
          Session.set('ranked',result);
        }
      });

  },
  'click .delegate-view': function(event, template){
    Session.set('drawerId',this._id);
    if($('.mdl-layout__drawer-right').hasClass('active')){
        $('.mdl-layout__drawer-right').removeClass('active');
     }
     else{
        $('.mdl-layout__drawer-right').addClass('active');
     }

  },
  'click #delegate-help'(event, template){
    var steps = [
      {
        element: '.search-wrapper',
        intro: "Search for delegates here.",
        position: 'top'
      },
      {
        element: '.delegate-item',
        intro: "Select preferred delegates from the list.",
        position: 'top'
      },
      {
        element: '.mdl-checkbox',
        intro: "Click the checkbox to select a delegate. You can choose a maximum of five.",
        position: 'top'
      },

    ];
    walkThrough(steps);
  }
});

function sortEventHandler(){
  $('#sortable').sortable({
    update: function(event, ui) {
      var order = $(this).sortable('toArray');
      Meteor.call('updateRanks',order,'delegate', function(error,result){
        if(error){
          RavenClient.captureException(error);
          Bert.alert(error.reason, 'danger');
        }else{
          Bert.alert(TAPi18n.__('pages.delegates.alerts.ranking-updated'), 'success');
        }
      });
    }
  });
}
