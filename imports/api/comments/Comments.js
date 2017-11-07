import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema';

export const Comments = new Meteor.Collection('comments');

CommentsSchema = new SimpleSchema({
	proposalId: {
        type: String,
    },
    authorId: {
        type: String,
    },
    message: {
        type: String,
    },
    createdAt: {
        type: Date,
        autoValue: function() {
            return new Date();
        }
    },

});

Comments.attachSchema(CommentsSchema);

Comments.allow({
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