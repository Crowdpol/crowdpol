import "./navigator_body.html";

Template.Navigator_Body.onCreated(function(){});
Template.Navigator_Body.onRendered(function(){});
Template.Navigator_Body.events({});
Template.Navigator_Body.helpers({
  globalContent: function(){
    return Session.get("globalTemplate");
  }
});
