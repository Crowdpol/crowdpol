import { Session } from 'meteor/session';

import './header.html';
import { Tags } from '../../../api/tags/Tags.js'

Template.Header.onCreated(function(){
  var self = this;
  var user = Meteor.user();

  if (user && user.roles){
    var currentRole = LocalStore.get('currentUserRole');
    if (!currentRole){
      LocalStore.set('currentUserRole', Meteor.user().roles[0]);
    }
  }
  self.availableTags = new ReactiveVar([]);
  self.matchedTags = new ReactiveVar([]);

  self.autorun(function(){
    //subscribe to list of existing tags
    self.subscribe('tags.all');
    self.availableTags.set(Tags.find().pluck('keyword'));
  });

});

Template.Header.helpers({
  hideHamburger() {
    $(".mdl-layout__drawer-button").hide();
  },
  showHamburger() {
    $(".mdl-layout__drawer-button").show();
  },
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
    return LocalStore.get('currentUserRole');
  },

  isCurrentRole(role){
    return (role == LocalStore.get('currentUserRole'));
  },
  matchedTags(){
    return Template.instance().matchedTags.get();
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
    LocalStore.set('currentUserRole', event.target.dataset.role)
  },
  'keyup input' (event, template) {
    var input = event.target.value;
    var matchedTags = matchTags(input, template.availableTags.get());
    template.matchedTags.set(matchedTags);
  },
  'mousedown .autocomplete-item' (event, template) {
    template.find('#header-tag-search').value = event.target.dataset.keyword;
    template.matchedTags.set([]);
  },
  'focusout input' (event, template){
   template.matchedTags.set([]);
  },
  'submit form, click #search-button' (event, template){
    var keyword = template.find('#header-tag-search').value;
    var url = Tags.findOne({keyword: keyword}).url
    FlowRouter.go(url)
  }
});

function getMenuRoles(userRoles){
  var menuRoles = ['individual', 'delegate', 'candidate'];
  return _.intersection(userRoles, menuRoles);
}

function matchTags(input, tags) {
  if (input) {
    var reg = new RegExp(input.split('').join('\\w*').replace(/\W/, ""), 'i');
    return tags.filter(function(tag) {
      if (tag.match(reg)) {
        return tag;
      }
    });
  } else {
    return [];
  } 
}

