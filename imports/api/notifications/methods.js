import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Notifications } from './Notifications.js'

Meteor.methods({
  createNotification: function(notification) {
    check(notification, {message: String, userId: String, url: String, icon: Match.Maybe(String)});
    return Notifications.insert(notification);
  },
  deleteNotification: function(notificationId) {
    check(notificationId, String);
    Notifications.remove(notificationId);
  },
  getNotification: function(notificationId){
    check(notificationId, String);
    return Notifications.findOne({_id: notificationId});
  },
  readNotification: function(notificationId){
    check(notificationId, String);
    Notifications.update({_id: notificationId}, {$set: {"read": true}});
  },
  markAllAsRead: function(userId){
    check(userId, String);
    Notifications.update({userId: userId}, {$set: {"read": true}}, { multi: true });
  }
});