import { Session } from 'meteor/session';

import './notifications.html';
import { Notifications } from '../../../api/notifications/Notifications.js'

Template.Notifications.onCreated(function(){
  var self = this;
  var user = Meteor.user();
  self.autorun(function(){
    self.subscribe('notifications.forUser', Meteor.userId());
  });

});

Template.Notifications.helpers({
  readNotifications(){
    return Notifications.find({read: true},{sort: {createdAt: -1}}).fetch();
  },
  unreadNotifications(){
    return Notifications.find({read: false},{sort: {createdAt: -1}}).fetch();
  },
  unreadNotificationCount(){
    return Notifications.find({read: false}).count();
  },
  readNotificationCount(){
    return Notifications.find({read: true}).count();
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
  }
});

Template.Notifications.events({
  'click .notification-item': function(event, template) {
    //FlowRouter.go(event.target.dataset.url);
    window.open(event.target.dataset.url, '_blank')
    //location.reload();
    Meteor.call('readNotification', event.target.dataset.id);
  },
  'click #mark-as-read': function(event, template) {
    Meteor.call('markAllAsRead', Meteor.userId());
  },
  'click #view-all': function(event, template) {
    FlowRouter.go('App.notifications');
  },
  'click .mdl-layout__obfuscator-right': function(event, template) {
    $('#notifications-menu').removeClass('active'); 
  }

});