import { Meteor } from 'meteor/meteor';
import "./candidates.html"
import { Ranks } from '../../../api/ranking/Ranks.js'
import RavenClient from 'raven-js';

Template.Candidate.onCreated(function () {
  Session.set('searchPhrase','');

  var self = this;
  self.ranks = new ReactiveVar([]);
  self.autorun(function() {
    self.subscribe("simpleSearch",Session.get('searchPhrase'),"candidate");
    self.subscribe('ranks.all');
    results = ReactiveMethod.call("getRanks", Meteor.userId(), "candidate");
    Session.set('ranked',results);
  });
});

Template.Candidate.onRendered(function () {
  $( "svg" ).delay( 750 ).fadeIn();
  Meteor.defer(function(){
    $( "#sortable" ).sortable({
      create: function( event, ui ) {
        console.log('create called');
      }
    });
    $( "#sortable" ).disableSelection();

    $( "#sortable" ).on("sortchange", sortEventHandler);

  });

});

Template.Candidate.helpers({
  getRanking: function(template) {

    result = Ranks.findOne({entityType: 'candidate', entityId: this._id, supporterId: Meteor.userId()});
    if(result){
      return result.ranking;
    }
    //$( "#sortable" ).sortable( "refreshPositions" );
  },
  ranks: function() {
    results = ReactiveMethod.call("getRanks", Meteor.userId(), "candidate");
    return Meteor.users.find( { _id : { $in :  Session.get('ranked')} } ,{sort: ["ranking"]} );
    /*
    return Meteor.users.find(
          { _id : { $in : Template.instance().ranks.get() } },
          { sort: [["score", "desc"]] }
        );

    result = Meteor.users.find();

    return result;
    */
  },
  candidates: function() {
    return Meteor.users.find( { $and: [
      { _id : { $nin : Session.get('ranked')}},
      { _id : { $ne: Meteor.userId()} }
    ]});
    //Meteor.users.find({ _id : { $nin :  Session.get('ranked')}});
    /*
    if (Session.get("searchPhrase")) {
    	//return Meteor.users.find({roles: "candidate"});
      return Meteor.users.find({$and:[
        {_id: { $ne: Meteor.userId() },
        { _id : { $nin :  Session.get('ranked')} }
        ]});
    } else {
      return Meteor.users.find({_id: { $ne: Meteor.userId() },{ _id : { $nin :  Session.get('ranked')} }});
    }
    */
  },
  searchPhrase: function() {
  	return Session.get('searchPhrase');
  }
});

Template.Candidate.events({
	'keyup #delegate-search': function(event, template){
		Session.set('searchPhrase',event.target.value);
	},
  'click .delegate-select': function(event, template){
    candidateId = this._id;
    //(entityType,entityId,supporterId,ranking)
    var ranks = Session.get('ranked');
    if(ranks.length>=5){
      Bert.alert(TAPi18n.__('pages.candidates.alerts.candidate-limit'), 'danger');
      event.target.checked = false;
    }else{
      Meteor.call('addRank','candidate',candidateId,(ranks.length +1),function(error,result){
        if (error) {
          console.log(error);
        } else {
          Session.set('ranked',result);
        }
      });
   }
  },
  'click .rank-select': function(event, template){
    candidateId = this._id;
    //(entityType,entityId,supporterId,ranking,create)


      Meteor.call('removeRank','candidate',candidateId,function(error,result){
        if (error) {
          console.log(error);
        } else {
          Session.set('ranked',result);
        }
      });

  },
  'click .candidate-view': function(event, template){
    Session.set('drawerId',this._id);
    if($('.mdl-layout__drawer-right').hasClass('active')){
        $('.mdl-layout__drawer-right').removeClass('active');
     }
     else{
        $('.mdl-layout__drawer-right').addClass('active');
     }

  }
});


function returnRanks(){
  Meteor.call('getRanks',Meteor.userId(),'candidate', function(error, result){
      if(error){
        console.log(error);
      }else{
        return result;
      }
  });
}

function sortEventHandler(){
  $('#sortable').sortable({
    update: function(event, ui) {
      var order = $(this).sortable('toArray');
      Meteor.call('updateRanks',order,'candidate', function(error,result){
        if(error){
          RavenClient.captureException(error);
          Bert.alert("Ranking failed. " + error.reason, 'danger');
        }else{
          Bert.alert("pages.candidates.alerts.ranking-updated", 'success');
        }
      });
    }
  });

}
