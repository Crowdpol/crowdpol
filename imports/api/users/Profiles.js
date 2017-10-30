import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
SimpleSchema.extendOptions(['autoform']);

export const Profiles = new Mongo.Collection('profiles');

Schema.Approval = SimpleSchema({
    type: {
      type: String,
      optional: true,
      allowedValues: ['individual', 'organisation', 'party', 'candidate'],
    },
    verified: {
        type: Boolean,
        optional: true,
        autoValue: function() {
            return false;
        }
    },
    verifiedBy: {
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

ProfileSchema = new SimpleSchema({
    createdAt: {
      type: Date,
      label: "Created At",
      autoform: {
        type: "hidden"
      },
      autoValue: function() {
        return new Date();
      }
    },
    userId: {
        type: String,
        label: "User",
        optional: true,
    },
    isPublic: {
      type: Boolean,
      optional: true,
    },
    website: {
        type: String,
        regEx: SimpleSchema.RegEx.Url,
        optional: true,
    },
    bio: {
        type: String,
        optional: true,
    },
    approvals: {
      type: Array,
      optional: true,
    },
    'approvals.$': {
      type: Schema.Approval,
      optional: true,
    },
}, { tracker: Tracker });

Profiles.attachSchema(ProfileSchema);

//export const Profile = new Mongo.Collection('profiles');

Profiles.allow({
  insert: function (userId) {

      return true;

  },
  update: function (userId) {
    if (userId) {
      return true;
    }
  },
  remove: function (userId) {
    if (userId) {
      return true;
    }
  },
});
