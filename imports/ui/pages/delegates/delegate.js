import { Meteor } from 'meteor/meteor';
import "./delegate.html"

Template.Delegate.onCreated(function () {
  Session.set('searchPhrase','');
  
  var self = this;
  self.ranks = new ReactiveVar([]);
  self.autorun(function() {
    self.subscribe("simpleSearch",Session.get('searchPhrase'),"delegate");
    results = ReactiveMethod.call("getRanks", Meteor.userId(), "delegate");
    Session.set('ranked',results);
  });
  
	
  
  	//Meteor.subscribe('users.delegates');
});

Template.Delegate.helpers({
  ranks: function() {
    results = ReactiveMethod.call("getRanks", Meteor.userId(), "delegate");
    console.log(results);
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
  delegates: function() {
    return Meteor.users.find({ _id : { $nin :  Session.get('ranked')}});
    /*
    if (Session.get("searchPhrase")) {
    	console.log("returning search");
    	//return Meteor.users.find({roles: "delegate"});	
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

Template.Delegate.events({
	'keyup #delegate-search': function(event, template){
		//console.log("keyup pressed");
		//console.log(event.target.value);
		Session.set('searchPhrase',event.target.value);
	},
  'click .delegate-select': function(event, template){
    delegateId = event.target.dataset.delegateId;
    Meteor.call('toggleRank','delegate',delegateId,Meteor.userId(),1,event.target.checked,function(error,result){
      if (error) {
        console.log(error);
      } else {
        console.log(result);
        Session.set('ranked',result);
      }
    });
    console.log(delegateId);
  },
});

Template.Ranks.helpers({
  ranks: function() {
    ranks = [];
    //Meteor.subscribe("users.all");
    Meteor.subscribe("user.ranks",Meteor.userId(),'delegate');
    ranks = Meteor.users.find({_id: { $ne: Meteor.userId() }});
    
    return ranks;
  }
});

function returnRanks(){
  Meteor.call('getRanks',Meteor.userId(),'delegate', function(error, result){
      if(error){
        console.log(error);
      }else{
        console.log("setting ranks");
        return result;
      }
  });
}