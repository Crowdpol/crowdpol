import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema';

export const Invitations = new Meteor.Collection('invitations');

InviteSchema = new SimpleSchema({
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
  icon: {
    type: String,
    optional: true
  },
  read: {
    type: Boolean,
    defaultValue: false,
    optional: false
  },
  accepted: {
    type: Boolean,
    optional: true
  },
  createdAt: {
    type: Date,
      autoValue() {
        if (this.isInsert) {
          return new Date();
        }
      },
  }
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
