import { Meteor } from 'meteor/meteor';
import "./delegate.html"

Template.Delegate.onCreated(function () {
	Session.set('searchPhrase','');
  	//Meteor.subscribe('users.delegates');
});

Template.Delegate.helpers({
  ranks: function() {
    Meteor.subscribe("ranks.all");
    return [{_id:123},{"_id":"345"}];//Ranks.find({});
  },
  delegates: function() {
    Meteor.subscribe("user.search", Session.get("searchPhrase"));
    if (Session.get("searchPhrase")) {
    	console.log("returning search");
    	//return Meteor.users.find({roles: "delegate"});	
      return Meteor.users.find({_id: { $ne: Meteor.userId() }}, { sort: [["score", "desc"]] });
    } else {
    	console.log("returning all");
      return Meteor.users.find({roles: "delegate"});
    }
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
    Meteor.call('addRank','delegate',delegateId,Meteor.userId(),1,function(error,result){
      if (error) {
        console.log(error);
      } else {
        console.log(result);
      }
    });
    console.log(delegateId);
  },
});
