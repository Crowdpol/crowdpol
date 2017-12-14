import { Meteor } from 'meteor/meteor';
import { Notifications } from '../Notifications.js';

Meteor.publish('notifications.forUser', function(userId) {
  return Notifications.find({userId: userId});
});

