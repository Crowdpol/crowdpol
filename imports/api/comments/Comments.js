import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema';

export const Comments = new Meteor.Collection('comments');

CommentsSchema = new SimpleSchema({
	proposalId: {
    type: String,
		optional: false
  },
	type: {
		type: String,
		allowedValues: ['comment','for', 'against'],
		optional: false,
	},
	message: {
		type: String,
		optional: false,
	},
	authorId: {
		type: String,
		optional: false,
	},
	createdAt: {
			type: Date,
			autoValue: function() {
					if (this.isInsert) {
							return new Date();
					}
			}
	},
	lastModified: {
			type: Date,
			autoValue: function() {
					if (this.isInsert) {
							return new Date();
					}
			}
	},
	"upVote": {
			type: Array,
			optional: true
	},
	'upVote.$': {
			type: String
	},
	"downVote": {
			type: Array,
			optional: true
	},
	'downVote.$': {
			type: String
	},
});

Comments.attachSchema(CommentsSchema);

Comments.allow({
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

Comments.deny({
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
