import "./profileImage.js"
import "./profileForm.js"
import "./profile.html"
import "./profile.css"
import "../../components/termsModal/termsModal.js"

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

