import "./search_body.html";

Template.Search_Body.onCreated(function(){});
Template.Search_Body.onRendered(function(){});
Template.Search_Body.events({});
Template.Search_Body.helpers({
  globalContent: function(){
    //console.log("calling globalContent: " + Session.get("globalTemplate"));
    //console.log(window.localStorage);
    return Session.get("globalTemplate");
  }
});
