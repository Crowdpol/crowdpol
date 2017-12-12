import "./userSearch.html";

Template.UserSearch.onCreated(function () {
  Session.set('searchPhrase','');
  
  var self = this;
  self.ranks = new ReactiveVar([]);
  self.autorun(function() {
    self.subscribe("userSearch",Session.get('searchPhrase'));
  });
});

Template.UserSearch.events({
	'keyup #invited':  function(event, template){
		console.log(event.currentTarget.value);
		Session.set('searchPhrase',event.currentTarget.value);
	}
});

Template.UserSearch.helpers({
  userMatches: function() {
    result = Meteor.users.find( { _id : { $ne: Meteor.userId()} });
    //result = Meteor.users.find();
    //console.log(result);
    return result;
  }
});
