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

//permissions
Ranks.allow({
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

Ranks.deny({
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