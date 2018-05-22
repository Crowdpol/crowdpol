import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Flags = new Mongo.Collection('flags');

const FlagSchema = new SimpleSchema({
  contentType: {
    // current stage of proposal
    type: String,
    allowedValues: ["proposal", "comment", "profile"]
  },
  contentId: {
    type: String,
    optional: false
  },
  //who created the report content
  createrId: {
    type: String,
    optional: false
  },
  //who reported the content
  flaggerId: {
    type: String,
    optional: false
  },
  category: {
    // current stage of proposal
    type: String,
    allowedValues: ["sexist", "racist", "langauge","other"]
  },
  other: {
    type: String,
    optional: true
  },
  justification: {
    type: String,
    optional: false
  },
  createdAt: {
    //Creation Date
    type: Date,
    optional: true,
    autoValue: function () {
      if (this.isInsert) {
        return new Date();
      }
    }
  },
  lastUpdate: {
    //Last update
    type: Date,
    optional: true,
    autoValue: function () {
      return new Date();
    }
  },
  status: {
    type: String,
    allowedValues: ["pending", "reviewed"]
  },
  outcome: {
    type: String,
    allowedValues: ["rejected", "blocked"]
  },
  communityId: {
        type: String,
        optional: false
    },
});


Flags.attachSchema(FlagSchema);

//permissions
Flags.allow({
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

Flags.deny({
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
