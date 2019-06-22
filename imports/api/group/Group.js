import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema';

export const Group = new Meteor.Collection('Group');

GroupSchema = new SimpleSchema({
  name: {
      type: String,
      optional: false,
  },
  handle: {
      type: String,
      optional: false,
  },
  photo: {
      type: String,
      optional: true,
  },
  hasCover: {
    type: Boolean,
    optional: false,
    autoValue() {
      if (this.isInsert) {
        return false;
      }
    },
  },
  coverURL: {
    type: String,
    optional: true
  },
  type: {
    type: String,
    allowedValues: ['organisation', 'party', 'social'],
    optional: true
  },
  invited: {
      type: Array,
      optional: true,
  },
  'invited.$': {
      type: String,
      optional: true,
  },
  admins: {
      type: Array,
      optional: true,
  },
  'admins.$': {
      type: String,
      optional: true,
  },
  invited: {
      type: Array,
      optional: true,
  },
  'invited.$': {
      type: String,
      optional: true,
  },
  open: {
      /* If a proposal is expired and the votes have been prepared for tallying */
      type: Boolean,
      autoValue() {
        if (this.isInsert) {
          return true;
        }
      },
  },
  communityId: {
      type: String,
      optional: false
  },
  verified: {
    type: Boolean,
    optional: false,
    autoValue() {
      if (this.isInsert) {
        return false;
      }
    },
  },
  bio: {
      type: String,
      optional: true
  },
  tags: {
      type: Array,
      optional: true,
  },
  "tags.$": {
      type: String,
      optional: true
  },
  website: {
      type: String,
      regEx: SimpleSchema.RegEx.Url,
      optional: true
  },
  phoneNumber: {
      type: String,
      optional: true
  },
  contactPerson: {
      type: String,
      optional: true
  },
  searchString: {
      type: String,
      optional: true,
  },
  createdAt: {
    type: Date,
      autoValue() {
        if (this.isInsert) {
          return new Date();
        }
      },
  }
});

Group.attachSchema(GroupSchema);

Group.allow({
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

Group.deny({
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
