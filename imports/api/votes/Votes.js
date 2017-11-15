import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema';

export const Votes = new Meteor.Collection('votes');

VotesSchema = new SimpleSchema({
	proposalId: {
        type: String,
    },
    vote: {
        type: String,
        allowedValues: ['yes', 'no'],
        defaultValue: 'yes'
    },
    voterHash: {
        type: String,
    },
    delegateId: {
        type: String,
        optional: true,
    },
    createdAt: {
        type: Date,
        autoValue: function() {
            return new Date();
        }
    },

});

Votes.attachSchema(VotesSchema);

Votes.allow({
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

Votes.deny({
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