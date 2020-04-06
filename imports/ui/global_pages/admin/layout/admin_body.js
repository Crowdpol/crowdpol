import "./admin_body.html";

Session.set("globalTemplate","Admin_Content_1");


Template.Admin_Body.onCreated(function(){
  Session.set("globalTemplate","Admin_Content_1");
});
Template.Admin_Body.onRendered(function(){});
Template.Admin_Body.events({});
Template.Admin_Body.helpers({
  globalContent: function(){
    return Session.get("globalTemplate");
  }
});
