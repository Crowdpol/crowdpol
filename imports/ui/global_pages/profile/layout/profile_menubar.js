import { getUserProfilePhoto, getUserfullname, getUsername, getUserTags, getUserInterests } from '../../../../utils/users';
import "./profile_menubar.html";

Template.Profile_Menubar.onCreated(function(){
  var self = this;
  let ownerId = getOwnerId();
  self.autorun(function(){
    //self.subscribe('users.profile');
  });
});
Template.Profile_Menubar.onRendered(function(){});
Template.Profile_Menubar.events({});
Template.Profile_Menubar.helpers({
  menuBarTitle: function(){
    return Session.get("menuBarTitle");
  },
  currentUserId: function(){
    return Meteor.userId();
  },
  currentUser: function(){
    if(getOwnerId()==Meteor.userId()){
      return true;
    }
    return false;
  },
  profileName: function(userId) {
  	return getUserfullname(getOwnerId());
  },
  profileUsername: function(userId) {
  	return "@" + getUsername(getOwnerId());
  },
});

function getOwnerId(){
  let userId = FlowRouter.getParam("id");
  if(typeof userId =='undefined'){
    userId = Meteor.userId();

  }
  console.log("ownerId: " + userId);
  return userId;
}
