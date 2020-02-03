import "./generic_menubar.html";

Template.Generic_Menubar.onCreated(function(){});
Template.Generic_Menubar.onRendered(function(){});
Template.Generic_Menubar.events({});
Template.Generic_Menubar.helpers({
  menuBarTitle: function(){
    return Session.get("menuBarTitle");
  },
});
