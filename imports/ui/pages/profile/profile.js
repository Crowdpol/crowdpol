import "./profileImage.js"
import "./profileForm.js"
import "./resetPassword"
import "./profile.html"
import "./profile.css"

Template.Profile.onCreated(function() {
  var self = this;
  Session.set('showSettings',Meteor.user().isPublic);
});

Template.Profile.events({

});

Template.Profile.helpers({
  showSettings: function(){
    return Session.get('showSettings');
  }
});

