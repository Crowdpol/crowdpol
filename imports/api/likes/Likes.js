import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema';

export const Likes = new Meteor.Collection('likes');

LikesSchema = new SimpleSchema({
    userId: {
        type: String,
        optional: false
    },
    objectType: {
      type: String,
      allowedValues: ['like', 'proposal','comment','argument','post'],
      optional: false
    },
    objectId: {
        type: String,
        optional: false
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

Likes.attachSchema(LikesSchema);

Likes.allow({
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

Likes.deny({
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
