import "./profile_cover.html";

Template.Profile_Cover.onCreated(function(){});
Template.Profile_Cover.onRendered(function(){});
Template.Profile_Cover.events({});
Template.Profile_Cover.helpers({
  thisUser: function() {
    return getOwnerId();
  },
});


function getOwnerId(){
  let userId = FlowRouter.getParam("id");
  if(typeof userId =='undefined'){
    userId = Meteor.userId();

  }
  //console.log("ownerId: " + userId);
  return userId;
}
