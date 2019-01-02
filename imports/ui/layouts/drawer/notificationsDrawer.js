import { Session } from 'meteor/session';

import './notificationsDrawer.html';
import { Notifications } from '../../../api/notifications/Notifications.js'

Template.NotificationsDrawer.onCreated(function(){
  var self = this;
  var user = Meteor.user();
  self.autorun(function(){
    self.subscribe('notifications.forUser', Meteor.userId());
  });

});

Template.NotificationsDrawer.helpers({
  readNotifications(){
    return Notifications.find({read: true},{sort: {createdAt: -1},limit: 5}).fetch();
  },
  unreadNotifications(){
    return Notifications.find({read: false},{sort: {createdAt: -1},limit: 5}).fetch();
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

Template.NotificationsDrawer.events({
  'click .notification-item': function(event, template) {
    FlowRouter.go(event.target.dataset.url);
    location.reload();
    Meteor.call('readNotification', event.target.dataset.id);
    $('.notification-menu-content').removeClass('active');
  },
  'click #mark-as-read': function(event, template) {
    Meteor.call('markAllAsRead', Meteor.userId());
    $('.notification-menu-content').removeClass('active');
  },
  'click .mdl-layout__obfuscator-right': function(event, template) {
    $('#notifications-menu').removeClass('active');
    $('.notification-menu-content').removeClass('active');
  },
  'click .view-all-link': function(event,template){
    $('.notification-menu-content').removeClass('active');
  }

});
