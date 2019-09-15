import { Session } from 'meteor/session';
import { userProfilePhoto } from '../../../utils/users';
import './header.html';
import './clamp.min.js'
import { Tags } from '../../../api/tags/Tags.js'
import { Notifications } from '../../../api/notifications/Notifications.js'
import { Communities } from '../../../api/communities/Communities.js'
import { walkThrough } from '../../../utils/functions';

Template.Header.onCreated(function(){
  //console.log("all communities count: " + Communities.find().count());
  var self = this;
  var user = Meteor.user();
  var subdomain = LocalStore.get('subdomain');
  var communityId = LocalStore.get('communityId');
  /* TODO: change date languages dynamically */
  //moment.locale('en');
  if (user && user.roles){
    var currentRole = LocalStore.get('currentUserRole');
    var userRoles = user.roles;
    var userDelegateCommunities = user.profile.delegateCommunities;
    //if (!currentRole){
      //console.log(userRoles);
      if(userRoles.indexOf("individual") > -1){
        //console.log("user is individual");
        LocalStore.set('currentUserRole', 'individual');
        LocalStore.set('otherRole','individual');
      }
      if(userRoles.indexOf("organisation") > -1){
        //console.log("user is organisation");
        LocalStore.set('currentUserRole', 'organisation');
        LocalStore.set('otherRole','organisation');
      }
      if(userRoles.indexOf("party") > -1){
        //console.log("user is organisation");
        LocalStore.set('currentUserRole', 'party');
        LocalStore.set('otherRole','party');
      }
      LocalStore.set('isDelegate',false);
      LocalStore.set('usingAsDelegate',false);
      //console.log("localstore currentUserRole: " + LocalStore.get('currentUserRole'));
      //console.log("localstore isDelegate: " + LocalStore.get('isDelegate'));
    //}
  }else{
    //console.log("user not signed in");
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
      //LocalStore.set('languages', languages);
      //Session.set("i18n_lang",lang)
      //TAPi18n.setLanguage(lang);
    });
  });

});

Template.Header.helpers({
  userPhoto: function() {
    let photoURL = userProfilePhoto(Meteor.userId());
    if(photoURL){
      return photoURL;
    }
  },
  title: function() {
    return "Crowdpol";//Template.instance().community.get().name;
  },
  logoUrlSet: function(){
    return true;
    /*
    let community = Template.instance().community.get();
    if(typeof community !='undefined'){
      let settings = community.settings;
      if(typeof settings !='undefined'){
        if(typeof settings.logoUrl !='undefined'){
          return true;
        }
      }
    }
    return false;*/
  },
  logoUrl: function() {
    //let community = Template.instance().community.get();
    //let settings = community.settings;
    return '/img/crowdpol_logo_transparent.png';//settings.logoUrl;
  },
  hideHamburger() {
    //$(".mdl-layout__drawer-button").hide();
  },
  showHamburger() {
    //$(".mdl-layout__drawer-button").show();
  },
  lang() {
    var str = Session.get("i18n_lang")
    if(!str){
      Session.set("i18n_lang","en");
      str = 'en';
    }
    return str.toUpperCase();

  },
  currentUserRole() {
    return LocalStore.get('currentUserRole');
  },
  currentUserRoleText() {
    let currentUserRole = LocalStore.get('currentUserRole');
    //console.log("currentUserRoleText: " + currentUserRole);
    switch (currentUserRole) {
      case 'individual':
          text = TAPi18n.__('layout.header.nav_using_individual');
          break;
      case 'organisation':
          text = TAPi18n.__('layout.header.nav_using_organisation');
          break;
      case 'party':
          text = TAPi18n.__('layout.header.nav_using_party');
          break;
      case 'delegate':
          text = TAPi18n.__('layout.header.nav_using_delegate');
          break;
      default:
          text = '';
    }
    return text;
  },
  otherRoleText(){
    let otherRole = LocalStore.get('otherRole');
    switch (otherRole) {
      case 'delegate':
          text = TAPi18n.__('layout.header.nav_use_delegate');
          break;
      case 'individual':
          text = TAPi18n.__('layout.header.nav_use_individual');
          break;
      case 'organisation':
          text = TAPi18n.__('layout.header.nav_use_organisation');
          break;
      case 'party':
          text = TAPi18n.__('layout.header.nav_use_party');
          break;
      default:
          text = TAPi18n.__('layout.header.nav_use_individual');
    }
    return text;
  },
  otherRole(){
    return LocalStore.get('otherRole');
  },
  usingAsDelegate(){
    return LocalStore.get('usingAsDelegate');
  },
  isDelegate() {
    var user = Meteor.user();
    var communityId = LocalStore.get('communityId');
    if (user && user.roles){
      var currentRole = LocalStore.get('currentUserRole');
      var userRoles = user.roles;
      var userDelegateCommunities = user.profile.delegateCommunities;
      //console.log("userDelegateCommunities.includes(communityId): " + userDelegateCommunities.includes(communityId));
      if((userRoles.indexOf("delegate") > -1)&&(userDelegateCommunities.includes(communityId))){
        //console.log("user has delegate role in community: " + communityId);
        LocalStore.set('isDelegate',true);
      }else{
        //console.log("user is not a delegate in community: " + communityId);
        LocalStore.set('isDelegate',false);
      }
    }
    return LocalStore.get('isDelegate');
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
    let settings = LocalStore.get('settings');
    var langs = settings.languages;
    if(langs){
      return true;
    }
    return false;
  },
  langs(){
    let settings = LocalStore.get('settings');
    var langs = settings.languages;
    if(langs){
      if (typeof langs !== 'undefined' && langs.length > 0) {
      // the array is defined and has at least one element
        //console.log("languages: " + langs);
        return langs;
      }
    }else{
      console.log("no langs");
    }


    return ['en'];
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
    moment.locale(lang);
  },
  'click #nav-logout' : function(e){
    event.preventDefault();
    LocalStore.set('currentUserRole','');
    LocalStore.set('isDelegate','');
    $('.logged-in-header').removeClass('delegate_header');
    console.log("header: set community to route");
    //setCommunityToRoot();
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
  'click .change-role'(event,template){
    let switchRole = event.target.dataset.role;
    //console.log("switching role from: " + LocalStore.get('currentUserRole') + " to:" + switchRole);

    LocalStore.set('otherRole',LocalStore.get('currentUserRole'));
    LocalStore.set('currentUserRole', switchRole);
    if(switchRole=='delegate'){
      $('.logged-in-header').addClass('delegate_header');
      LocalStore.set('usingAsDelegate',true);
    }else{
      LocalStore.set('usingAsDelegate',false);
      $('.logged-in-header').removeClass('delegate_header');
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
    toggleNotificationsMenu();
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
function toggleNotificationsMenu(){
    if($('.notification-menu-content').hasClass('active')){
        $('.notification-menu-content').removeClass('active');
     }
     else{
        $('.notification-menu-content').addClass('active');
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
