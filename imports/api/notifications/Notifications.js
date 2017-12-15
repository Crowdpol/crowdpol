import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema';

export const Notifications = new Meteor.Collection('notifications');

NotificationsSchema = new SimpleSchema({
  userId: {
      type: String,
      optional: false,
  },
	url: {
    type: String,
    optional: true
  },
  message: {
    type: String,
    optional: false
  },
  read: {
    type: Boolean,
    defaultValue: false,
    optional: false
  },
  createdAt: {
    type: Date,
    autoValue: function() {
      return new Date();
    }
  },

});

Notifications.attachSchema(NotificationsSchema);

Notifications.allow({
  insert() {
    return false;
  },
  update() {
    return false;
  },
  remove() {
    return false;
  },
});

Notifications.deny({
  insert() {
    return true;
  },
  update() {
    return true;
  },
  remove() {
    return true;
  },
});