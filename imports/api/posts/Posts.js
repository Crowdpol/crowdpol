import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema';

export const Posts = new Meteor.Collection('posts');

PostsSchema = new SimpleSchema({
  userId: {
      type: String,
      optional: false,
  },
  /*
	url: {
    type: String,
    optional: true
  },*/
  message: {
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

Posts.attachSchema(PostsSchema);

Posts.allow({
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

Posts.deny({
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
