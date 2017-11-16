import { Meteor } from 'meteor/meteor';
import "./candidates.html"
import { Ranks } from '../../../api/ranking/Ranks.js'

Template.Candidate.onCreated(function () {
  Session.set('searchPhrase','');
  
  var self = this;
  self.ranks = new ReactiveVar([]);
  self.autorun(function() {
    self.subscribe("simpleSearch",Session.get('searchPhrase'),"candidate");
    self.subscribe('ranks.all');
    results = ReactiveMethod.call("getRanks", Meteor.userId(), "candidate");
    //console.log(results);
    Session.set('ranked',results);
    //console.log("autorun complete");
  });
  
	
  
  	//Meteor.subscribe('users.candidates');
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
    //console.log("rendered");  

  });

});

Template.Candidate.helpers({
  getRanking: function(template) {
    
    result = Ranks.findOne({entityType: 'candidate', entityId: this._id, supporterId: Meteor.userId()});
    if(result){
      //console.log("return rank");
      return result.ranking;
    }
    //console.log("sorting");
    //$( "#sortable" ).sortable( "refreshPositions" );
  },
  ranks: function() {
    results = ReactiveMethod.call("getRanks", Meteor.userId(), "candidate");
    //console.log(results);
    return Meteor.users.find( { _id : { $in :  Session.get('ranked')} } );
    /*
    console.log(Template.instance().ranks.get());
    console.log(returnRanks());
    return Meteor.users.find(
          { _id : { $in : Template.instance().ranks.get() } }, 
          { sort: [["score", "desc"]] }
        );
    
    result = Meteor.users.find();
    console.log(result.data);

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
    	console.log("returning search");
    	//return Meteor.users.find({roles: "candidate"});	
      return Meteor.users.find({$and:[
        {_id: { $ne: Meteor.userId() },
        { _id : { $nin :  Session.get('ranked')} }
        ]});
    } else {
    	console.log("returning all");
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
		//console.log("keyup pressed");
		//console.log(event.target.value);
		Session.set('searchPhrase',event.target.value);
	},
  'click .delegate-select': function(event, template){
    //console.log(this._id);
    //console.log(template);
    candidateId = this._id;
    //console.log(candidateId);
    //(entityType,entityId,supporterId,ranking)
    var ranks = Session.get('ranked');
    //console.log(ranks.length);
    if(ranks.length>=5){
      Bert.alert("You can only have 5 candidates.", 'danger');
      event.target.checked = false;
    }else{
      Meteor.call('addRank','candidate',candidateId,1,function(error,result){
        if (error) {
          console.log(error);
        } else {
          //console.log(result);
          Session.set('ranked',result);
        }
      });
   }
  },
  'click .rank-select': function(event, template){

    candidateId = this._id;
    //console.log(this._id);
    //(entityType,entityId,supporterId,ranking,create)
    

      Meteor.call('removeRank','candidate',candidateId,1,function(error,result){
        if (error) {
          console.log(error);
        } else {
          //console.log(result);
          Session.set('ranked',result);
        }
      });

  },
  'click .candidate-view': function(event, template){
    //console.log('show drawer ' + this._id);
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
        //console.log("setting ranks");
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
          console.log(error)
          Bert.alert("Ranking failed. " + error.reason, 'danger');
        }else{
          //console.log(result);
          Bert.alert("Ranking updated.", 'success');
        }
      });
    }
  });
  /*
  var idsInOrder = $("#sortable").children();
  jQuery.each( idsInOrder, function( i, val ) {
    console.log("i: " + (i+1) + " val: " + val.id);
  })
  console.log(idsInOrder);
  
  var listItems = $("#sortable li");
  var ranking = [];
  listItems.each(function(idx, li) {
      var product = $(li);
      if(!(product).hasClass( "ui-sortable-placeholder" )){
        ranking.push(this.id);
      }else{
        console.log("ignore placeholder");
      }
      
      // and the rest of your code
  });
  console.log(ranking)
  */
}