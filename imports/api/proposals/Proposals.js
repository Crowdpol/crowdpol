import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';

export const Proposals = new Mongo.Collection('proposals');

if ( Meteor.isServer ) {
  //Proposals._ensureIndex( { title: 1, abstract: 1, body: 1 } );
}

ArgumentSchema = new SimpleSchema({
  type: {
    type: String,
    allowedValues: ['for', 'against'],
    optional: false,
  },
  message: {
    type: String,
    optional: false,
  },
  authorId: {
    type: Boolean,
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

TranslationSchema = new SimpleSchema({
    language: {
        type: String,
        optional: false
    },
    title: {
        type: String,
        optional: true
    },
    abstract: {
        type: String,
        optional: true
    },
    body: {
        type: String,
        optional: true
    },
    "argumentsFor": {
        type: Array,
        optional: true
    },
    'argumentsFor.$': {
        type: ArgumentSchema,
        optional: true,
    },
    "argumentsAgainst": {
        type: Array,
        optional: true
    },
    'argumentsAgainst.$': {
        type: ArgumentSchema,
        optional: true,
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
    }
});

ProposalSchema = new SimpleSchema({
    content: {
        type: Array,
        optional: true,
    },
    'content.$': {
        type: TranslationSchema,
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
    startDate: {
        type: Date,
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
    signatures: {
        type: Array,
        optional: true,
    },
    'signatures.$': {
        type: String,
        optional: true,
    },

    votesFinalised: {
        /* If a proposal is expired and the votes have been prepared for tallying */
        type: Boolean,
        autoValue() {
          if (this.isInsert) {
            return false;
          }
        },
    },
    communityId: {
        type: String,
        optional: false
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
