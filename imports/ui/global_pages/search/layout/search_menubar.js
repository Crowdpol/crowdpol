import "./search_menubar.html";

Template.Search_Menubar.onCreated(function(){});
Template.Search_Menubar.onRendered(function(){});
Template.Search_Menubar.events({});
Template.Search_Menubar.helpers({
  menuBarTitle: function(){
    return Session.get("menuBarTitle");
  },
});
