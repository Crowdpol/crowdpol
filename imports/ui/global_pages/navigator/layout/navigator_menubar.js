import "./navigator_menubar.html";

Template.Navigator_Menubar.onCreated(function(){});
Template.Navigator_Menubar.onRendered(function(){});
Template.Navigator_Menubar.events({});
Template.Navigator_Menubar.helpers({
  menuBarTitle: function(){
    return Session.get("menuBarTitle");
  },
});
