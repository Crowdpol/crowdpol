import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { convertToSlug } from '../../utils/functions';

export const Ranks = new Mongo.Collection('ranks');

const RankSchema = new SimpleSchema({
  entityType: {
    type: String,
    allowedValues: ['delegate','candidate'],
    optional: false
  },
  entityId: {
    type: String,
    optional: false
  },
  supporterId: {
    type: String,
    optional: false
  },
  ranking: {
    type: Number,
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
  }
});

Ranks.attachSchema(RankSchema);

/*
*  FIX: temporary workaround
*  TBD: apply security best practices
*  All to methods, validate paramenters
*/
//permissions
Ranks.allow({
  insert: function (userId) {
    if (userId) {
      return true;
    }
    return false;
  },
  update: function (userId) {
    if (userId) {
      return true;
    }
    return false;
  },
  remove: function (userId) {
    if (userId) {
      return true;
    }
    return false;
  },
});
