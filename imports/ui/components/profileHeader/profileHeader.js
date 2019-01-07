import './profileHeader.html';
import '../../components/profileHeader/profileHeader.js';

Template.ProfileHeader.helpers({
  profilePic: function() {
  	return Meteor.user().profile.photo;
  },
  profileName: function() {
  	return (Meteor.user().profile.firstName + " " + Meteor.user().profile.lastName);
  },
  profileUsername: function() {
  	return Meteor.user().profile.username;
  }
});
