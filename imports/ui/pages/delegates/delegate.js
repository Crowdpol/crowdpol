import { Meteor } from 'meteor/meteor';
import "./delegate.html"
import { Ranks } from '../../../api/ranking/Ranks.js'
import RavenClient from 'raven-js';
import { walkThrough } from '../../../utils/functions';

Template.Delegate.onCreated(function () {
  Session.set('searchPhrase','');

  // Set user's ranked delegates
  Meteor.call('getRanks', Meteor.userId(), "delegate", function(error, result){
    if(error) {
      RavenClient.captureException(error);
      Bert.alert(error.reason, 'danger');
    } else {
      Session.set('ranked', result);
    }
  });
  
  var self = this;
  self.ranks = new ReactiveVar([]);
  var communityId = LocalStore.get('communityId');
  self.autorun(function() {
    self.subscribe("simpleSearch",Session.get('searchPhrase'),"delegate", communityId);
    self.subscribe('ranks.all');
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
  getRanking: function(template) {
    
    result = Ranks.findOne({entityType: 'delegate', entityId: this._id, supporterId: Meteor.userId()});
    if(result){
      return result.ranking;
    }
  },
  ranks: function() {
    return Meteor.users.find( { _id : { $in :  Session.get('ranked')} },{sort: ["ranking"]} );
  },
  delegates: function() {
    return Meteor.users.find( { $and: [ 
      { _id : { $nin : Session.get('ranked')}},
      { _id : { $ne: Meteor.userId()} }
    ]});
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
    delegateId = this._id;
    var ranks = Session.get('ranked');
    if(ranks.length>=5){
      Bert.alert(TAPi18n.__('pages.delegates.alerts.delegate-limit'), 'danger');
      event.target.checked = false;
    }else{
      Meteor.call('addRank','delegate',delegateId,(ranks.length +1),function(error,result){
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
    
      Meteor.call('removeRank','delegate',delegateId,function(error,result){
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