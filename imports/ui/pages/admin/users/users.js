import './users.html'

Template.users.onCreated(function() {
  var self = this;
  self.autorun(function() {
    self.subscribe('users');
  });
});

Template.users.helpers({
  users: ()=> {
    return Meteor.users.find({});
  }
});