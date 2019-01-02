import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema';

export const DelegateVotes = new Meteor.Collection('delegateVotes');

DelegateVotesSchema = new SimpleSchema({
	proposalId: {
    type: String,
  },
  vote: {
    type: String,
    allowedValues: ['yes', 'no','abstain'],
    defaultValue: 'yes'
  },
  delegateId: {
    type: String,
  },
  reason: {
    type: String,
    optional: true
  },
  createdAt: {
    type: Date,
    autoValue: function() {
      return new Date();
    }
  },

});

DelegateVotes.attachSchema(DelegateVotesSchema);

DelegateVotes.allow({
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

DelegateVotes.deny({
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
