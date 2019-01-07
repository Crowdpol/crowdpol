import './settings.html';
import '../../components/profileHeader/profileHeader.js';

Template.ProfileSettings.onCreated(function() {
  self = this;
	// Reactive and Session Vars
	self.currentView = new ReactiveVar('profile');
});

Template.ProfileSettings.helpers({
  profilePic: function() {
  	return Meteor.user().profile.photo;
  },
  profileName: function() {
  	return (Meteor.user().profile.firstName + " " + Meteor.user().profile.lastName);
  },
  profileUsername: function() {
  	return Meteor.user().profile.username;
  },
  showProfile: function(){
    var show = Template.instance().currentView.get();
    if(show=="profile"){
      return true;
    }
    return false;
  },
  showInterests: function(){
    var show = Template.instance().currentView.get();
    if(show=="interests"){
      return true;
    }
    return false;
  },
  showPassword: function(){
    var show = Template.instance().currentView.get();
    if(show=="password"){
      return true;
    }
    return false;
  },
  showProfileSettings: function(){
    var show = Template.instance().currentView.get();
    if(show=="profile-settings"){
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

Template.ProfileSettings.events({
  'click #showProfile' (event, template) {
    event.preventDefault();
    template.currentView.set('profile')
  },
  'click #showPassword' (event, template) {
    event.preventDefault();
    template.currentView.set('password')
  },
  'click #showInterests' (event, template) {
    event.preventDefault();
    template.currentView.set('interests')
  },
  'click #showProfileSettings' (event, template) {
    event.preventDefault();
    template.currentView.set('profile-settings')
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
  },
});
