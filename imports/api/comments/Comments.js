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
		allowedValues: ['comment','for','against','admin','invite-rejection'],
		optional: false,
	},
	language: {
		type: String,
		optional: true
	},
	message: {
		type: String,
		optional: false,
	},
	authorId: {
		type: String,
		optional: false,
	},
	argumentId:{
		type: String,
		optional: true,
	},
	closed:{
		type: Boolean,
		optional: true,
		autoValue: function() {
				if (this.isInsert) {
						return false;
				}
		}
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
	"upVoteCount": {
		type: Number,
		autoValue: function() {
				if (this.isInsert) {
						return 0;
				}
		}
	},
	"downVoteCount": {
		type: Number,
		autoValue: function() {
				if (this.isInsert) {
						return 0;
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
