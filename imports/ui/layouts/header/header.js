import { Session } from 'meteor/session';

import './header.html';
import './clamp.min.js'
import { Tags } from '../../../api/tags/Tags.js'
import { Notifications } from '../../../api/notifications/Notifications.js'
import { Communities } from '../../../api/communities/Communities.js'
import { walkThrough } from '../../../utils/functions';

Template.Header.onCreated(function(){
  var self = this;
  var user = Meteor.user();
  var subdomain = LocalStore.get('subdomain');
  var communityId = LocalStore.get('communityId');
  /* TODO: change date languages dynamically */
  moment.locale('en');

  if (user && user.roles){
    var currentRole = LocalStore.get('currentUserRole');
    if (!currentRole){
      LocalStore.set('currentUserRole', 'individual');
    }
  }
  self.availableTags = new ReactiveVar([]);
  self.matchedTags = new ReactiveVar([]);
  self.community = new ReactiveVar();

  self.autorun(function(){
    //subscribe to list of existing tags
    self.subscribe('tags.community', communityId);
    //self.subscribe('notifications.forUser', Meteor.userId());
    self.availableTags.set(Tags.find().pluck('keyword'));
    self.subscribe('communities.subdomain', subdomain, function(){
      self.community.set(Communities.findOne({subdomain: subdomain}));
      //set default language for community is none is selected
      var community = Communities.findOne({subdomain: subdomain});
      var lang = community.settings.defaultLanguage;
      var languages = community.settings.languages;
      LocalStore.set('languages', languages);
      Session.set("i18n_lang",lang)
      TAPi18n.setLanguage(lang);
    });
  });

});

Template.Header.helpers({
  title: function() {
    return Template.instance().community.get().name;
  },
  logoUrlSet: function(){
    let community = Template.instance().community.get();
    if(typeof community !='undefined'){
      let settings = community.settings;
      if(typeof settings !='undefined'){
        if(typeof settings.logoUrl !='undefined'){
          return true;
        }
      }
    }
    return false;
  },
  logoUrl: function() {
    let community = Template.instance().community.get();
    let settings = community.settings;
    return settings.logoUrl;
  },
  hideHamburger() {
    //$(".mdl-layout__drawer-button").hide();
  },
  showHamburger() {
    //$(".mdl-layout__drawer-button").show();
  },
  lang() {
    var str = Session.get("i18n_lang")
    return str.toUpperCase();
  },

  matchedTags(){
    return Template.instance().matchedTags.get();
  },
  /*
  notifications(){
    return Notifications.find({},{sort: {createdAt: -1}}).fetch();
  },
  unreadNotificationCount(){
    return Notifications.find({read: false}).count();
  },
  notificationCount(){
    return Notifications.find().count();
  },
  notificationItemClass(read) {
    if (read){
      return 'read'
    } else {
      return 'unread'
    }
  },
  notificationDate(createdAt) {
    return moment(createdAt).fromNow();
  },
  unreadClass(){
    if (Notifications.find({read: false}).count() == 0){
      return 'noUnreads'
    }
  },
  */
  showLanguages(){
    var langs = Template.instance().community.get().settings.languageSelector;
    if(langs.length > 1){
      return true;
    }
    return false;
  },
  langs(){
    var langs = LocalStore.get('languages');
    if (typeof langs !== 'undefined' && langs.length > 0) {
    // the array is defined and has at least one element

      return langs;
    }
    return 0;
  },
  getLang(lang){
    switch (lang) {
    case 'en':
          text = TAPi18n.__('layout.header.lang_en');
          break;
      case 'sv':
          text = TAPi18n.__('layout.header.lang_sv');
          break;
      case 'cy':
          text = TAPi18n.__('layout.header.lang_cy');
          break;
      case 'ja':
          text = TAPi18n.__('layout.header.lang_ja');
          break;
      default:
          text = TAPi18n.__('layout.header.lang_en');
    }
    return text;
  }
});

Template.Header.events({
  'click .lang-sel' : function(e){
    var lang = $(e.currentTarget).attr("id");
    Session.set("i18n_lang",lang)
    TAPi18n.setLanguage(lang);
    /* TODO: change locale dynamically*/
    moment.locale(lang);
  },
  'click #nav-logout' : function(e){
    event.preventDefault();
    Meteor.logout();
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
  'focusout input' (event, template) {
   template.matchedTags.set([]);
  },
  'submit form, click #search-button' (event, template) {
    var keyword = template.find('#header-tag-search').value;
    var tag = Tags.findOne({keyword: keyword});
    if (tag) {
      var url = tag.url;
      FlowRouter.go(url);
    } else {
      FlowRouter.go('/tag/' + keyword);
    }
  },
  'click #main-help'(event, template){
    event.preventDefault();
    var steps = [
      {
        element: '#main-help',
        intro: TAPi18n.__('tutorial.header.intro'),
        position: 'bottom'
      },
      {
        element: document.querySelector('.mdl-layout__drawer-button'),
        intro: "This is your profile menu", //TAPi18n.__('tutorial.header.right-drawer')
        position: 'bottom'
      },
      {
        element: '#main-menu',
        intro: "This is where you can access the main features.",//TAPi18n.__('tutorial.header.main-menu')
      },
      {
        element: '#dash-menu',
        intro: 'This takes you to your dashboard.',//TAPi18n.__('tutorial.header.dash-menu-item')
        position: 'bottom'
      },
      {
        element: '#vote-menu',
        intro: 'Vote on proposals here.',//TAPi18n.__('tutorial.header.vote-menu-item')
        position: 'bottom'
      },
      {
        element: '#proposals-menu',
        intro: 'Checkout proposals you have created here.',//TAPi18n.__('tutorial.header.proposal-menu-item')
        position: 'bottom'
      },
      {
        element: '#delegate-menu',
        intro: 'Chose your delegates here.',//TAPi18n.__('tutorial.header.delegate-menu-item')
        position: 'bottom'
      },
      {
        element: '#notifications-menu-icon',
        intro: 'Check your latest notifications.',//TAPi18n.__('tutorial.header.notification-menu-item)
        position: 'bottom'
      },
      {
        element: '#language-menu',
        intro: 'Select your language.',//TAPi18n.__('tutorial.header.language-menu-item')
        position: 'bottom'
      }
    ];
    walkThrough(steps);
  },
  'click #notifications-menu-icon': function(event, template) {
    toggleNotificationsDrawer();
  },
  /*
  'click .notification-item': function(event, template) {
    FlowRouter.go(event.target.dataset.url);
    location.reload();
    Meteor.call('readNotification', event.target.dataset.id);
  },
  'click #mark-as-read': function(event, template) {
    Meteor.call('markAllAsRead', Meteor.userId());
  },
  'click .mdl-layout__obfuscator-right': function(event, template) {
    $('#notifications-menu').removeClass('active');
  }
  */
});

function toggleNotificationsDrawer(){
  var items = document.getElementsByClassName('mdl-list__item-text-body notification-item-text')
    _.map(items, function(el){$clamp(el, {clamp: 3});})

    if($('#notifications-menu').hasClass('active')){
        $('#notifications-menu').removeClass('active');
     }
     else{
        $('#notifications-menu').addClass('active');
     }
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
