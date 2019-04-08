import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Flags = new Mongo.Collection('flags');

const FlagSchema = new SimpleSchema({
  contentType: {
    // current stage of proposal
    type: String,
    allowedValues: ["proposal", "comment", "profile","for","against"]
  },
  contentId: {
    type: String,
    optional: false
  },
  //who created the report content
  creatorId: {
    type: String,
    optional: false
  },
  //who reported the content
  flaggerId: {
    type: String,
    optional: false
  },
  //what is the nature of the offense (should be violations of the AUP)
  category: {
    type: String,
    //allowedValues: ["sexist", "racist", "langauge","other"],
    optional: false
  },
  //description of the offensive content
  other: {
    type: String,
    optional: true
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
      if (this.isUpdate) {
        return new Date();
      }
    }
  },
  status: {
    type: String,
    allowedValues: ["pending", "reviewed","resolved"],
    optional: true
  },
  //what action was taken by the reviewer
  outcome: {
    type: String,
    allowedValues: ["rejected", "blocked","ignored"],
    optional: true
  },
  //text based justification of editorial review
  justification: {
    type: String,
    optional: true
  },
  //who reviewed the content
  reviewerId: {
    type: String,
    optional: true
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
