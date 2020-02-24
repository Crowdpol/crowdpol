import "./presence_cover.html";

Template.Presence_Cover.onCreated(function(){});
Template.Presence_Cover.onRendered(function(){});
Template.Presence_Cover.events({});
Template.Presence_Cover.helpers({
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
