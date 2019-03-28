import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema';

export const Invitations = new Meteor.Collection('invitations');

InviteSchema = new SimpleSchema({
  userId: {
    type: String,
    optional: false,
  },
	type: {
    type: String,
    allowedValues: ['proposal'],
    optional: true
  },
  objectId: {
    type: String,
    optional: false,
  },
  message: {
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

Invitations.attachSchema(InviteSchema);

Invitations.allow({
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

Invitations.deny({
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
