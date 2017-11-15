import { Session } from 'meteor/session';

import './header.html';

Template.Header.onCreated(function(){
  var self = this;
  var user = Meteor.user();

  if (user && user.roles){
    var currentRole = Session.get('currentUserRole');
    if (!currentRole){
      Session.set('currentUserRole', Meteor.user().roles[0]);
    }
  }
});

Template.Header.helpers({
	lang() {
		var str = Session.get("i18n_lang")
		return str.toUpperCase();
	},

  userHasMultipleRoles(){
    var user = Meteor.user();
    var userRoles = user.roles;
    if (user && userRoles) {
      var roles = getMenuRoles(userRoles);
      return roles.length > 1;
    }
    return false;
  },

  roles(){
    var userRoles = Meteor.user().roles;
    var roles = getMenuRoles(userRoles);
    //Capitalise first letter of role name
    return _.map(roles, function(role){ return role.charAt(0).toUpperCase() + role.slice(1);; });
  },

  currentRole(){
    return Session.get('currentUserRole');
  },

  isCurrentRole(role){
    return (role == Session.get('currentUserRole'));
  }
});

Template.Header.events({
  'click .lang-sel' : function(e){
    var lang = $(e.currentTarget).attr("id");
    Session.set("i18n_lang",lang)
    TAPi18n.setLanguage(lang);
  },
  'click #nav-logout' : function(e){
    event.preventDefault();
	Meteor.logout();
  },
  'click .role-menu-item' : function(){
    Session.set('currentUserRole', event.target.dataset.role);
  }
});

function getMenuRoles(userRoles){
  var menuRoles = ['individual', 'delegate', 'candidate'];
  return _.intersection(userRoles, menuRoles);
}

