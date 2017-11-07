import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';

export const Proposals = new Mongo.Collection('proposals');

ProposalSchema = new SimpleSchema({
    title: {
        type: String,
    },
    abstract: {
        type: String,
    },
    body: {
        type: String,
    },
    createdAt: {
        type: Date,
        autoValue: function() {
            return new Date();
        }
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date,
    },
    stage: {
        // current stage of proposal
        type: String,
        allowedValues: ['draft', 'submitted', 'live'],
        defaultValue: 'draft'
    },
    status: {
        // status of proposal regarding admin approval
        type: String,
        allowedValues: ['new', 'pending', 'approved', 'rejected'],
        defaultValue: 'new'
    },
    authorId: {
        type: String,
    },
});

Proposals.attachSchema(ProposalSchema);

Proposals.allow({
  insert() {
    return true;
  },
  update: function(proposalId, doc) {
    return true;
    },
  remove() {
    return true;
  },
});
