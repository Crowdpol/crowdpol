import "./generic_body.html";
Session.set("globalTemplate","Generic_Content_1")


Template.Generic_Body.onCreated(function(){});
Template.Generic_Body.onRendered(function(){});
Template.Generic_Body.events({});
Template.Generic_Body.helpers({
  globalContent: function(){
    return Session.get("globalTemplate");
  }
});
