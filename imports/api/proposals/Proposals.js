import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';

export const Proposals = new Mongo.Collection('proposals');

if ( Meteor.isServer ) {
  //Proposals._ensureIndex( { title: 1, abstract: 1, body: 1 } );
}

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
        allowedValues: ['unreviewed', 'approved', 'rejected'],
        defaultValue: 'unreviewed'
    },
    authorId: {
        type: String,
    },
    invited: {
        type: Array,
        optional: true,
    },
    'invited.$': {
        type: String,
        optional: true,
    },
    tags: {
        type: Array,
        optional: true,
    },
    "tags.$": {
        type: Object,
        optional: true
    },
    "tags.$.keyword": {
        type: String,
        optional: true
    },
    "tags.$._id": {
        type: String,
        optional: true
    },
    "tags.$.url": {
        type: String,
        optional: true
    },
    "pointsFor": {
        type: Array,
        optional: true
    },
    'pointsFor.$': {
        type: String
    },
    "pointsAgainst": {
        type: Array,
        optional: true
    },
    'pointsAgainst.$': {
        type: String
    },
    "references": {
        type: Array,
        optional: true
    },
    'references.$': {
        type: String
    },
});

Proposals.attachSchema(ProposalSchema);

Proposals.allow({
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

Proposals.deny({
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
