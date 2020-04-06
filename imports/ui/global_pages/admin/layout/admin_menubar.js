import "./admin_menubar.html";

Template.Admin_Menubar.onCreated(function(){});
Template.Admin_Menubar.onRendered(function(){});
Template.Admin_Menubar.events({});
Template.Admin_Menubar.helpers({
  menuBarTitle: function(){
    return Session.get("menuBarTitle");
  },
});
