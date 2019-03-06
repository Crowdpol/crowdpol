import './accountSettings.html';

Template.AccountSettings.onCreated(function() {
  self = this;
	// Reactive and Session Vars
	self.currentView = new ReactiveVar('notifications');
});
/*
Template.AccountSettings.onRendered(function() {
  self = this;
	// Reactive and Session Vars
});
*/
Template.AccountSettings.helpers({
  thisUser: function() {
    return Meteor.userId();
  },
  profilePic: function() {
  	return Meteor.user().profile.photo;
  },
  profileName: function() {
  	return (Meteor.user().profile.firstName + " " + Meteor.user().profile.lastName);
  },
  profileUsername: function() {
  	return Meteor.user().profile.username;
  },
  showPassword: function(){
    var show = Template.instance().currentView.get();
    if(show=="password"){
      return true;
    }
    return false;
  },
  showNotificationSettings: function(){
    var show = Template.instance().currentView.get();
    if(show=="notification-settings"){
      return true;
    }
    return false;
  },
  showAccountSettings: function(){
    var show = Template.instance().currentView.get();
    if(show=="account-settings"){
      return true;
    }
    return false;
  },
  showPrivacySettings: function(){
    var show = Template.instance().currentView.get();
    if(show=="privacy-settings"){
      return true;
    }
    return false;
  }
});

Template.AccountSettings.events({
  'click #showPassword' (event, template) {
    event.preventDefault();
    template.currentView.set('password')
  },
  'click #showAccountSettings' (event, template) {
    event.preventDefault();
    template.currentView.set('account-settings')
  },
  'click #showNotificationSettings' (event, template) {
    event.preventDefault();
    template.currentView.set('notification-settings')
  },
  'click #showPrivacySettings' (event, template) {
    event.preventDefault();
    template.currentView.set('privacy-settings')
  }
});
