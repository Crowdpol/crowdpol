import { Meteor } from 'meteor/meteor';
import "./delegate.html"

Template.Delegate.onCreated(function () {
	Session.set('searchPhrase','');
  	//Meteor.subscribe('users.delegates');
});

Template.Delegate.helpers({
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
	}
});
