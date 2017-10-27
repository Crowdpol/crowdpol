import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
SimpleSchema.extendOptions(['autoform']);

export const Profiles = new Mongo.Collection('profiles');

/*
Delegate = new SimpleSchema({
  approved: {
    type: Boolean,
    defaultValue: false,
    label: 'Publish',
  },
  approvedBy: {
    type: String,
    optional: true,
  },
  nominations: {
    type: Array,
    optional: true,
  },
  'nominations.$': {
    type: Nomination,
    optional: true,
  },
  type: {
      type: String,
      optional: true,
      autoform: {
         type: 'select',
         label: "Type of Delegate",
            placeholder: "schemaLabel",
         options: function (){
          return[{label:"Person",value:"Person"},{label:"Organisation",value:"Organisation"}]
          }
      }
    }
});

VerificationSchema = SimpleSchema({
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
    verifiedOn: {
        type: String,
        optional: true,
    },
    createdAt: {
        type: Date,
        label: "Created At",
        autoValue: function() {
            return new Date();
        }
    },
});
*/
ProfileSchema = new SimpleSchema({
    userId: {
        type: String,
        label: "User",
        optional: true,
    },
    isPublic: {
      type: Boolean,
      optional: true,
    },
    isVerified: {
      type: Boolean,
      optional: true,
    },
    photo:{
      type: String,
      optional: true,
    },
    /*
    verification: {
      type: VerificationSchema,
      optional: true,
    },
    nomination: {
      
    }
    */
    name: {
      type: String,
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
    canDelegate: {
      type: Boolean,
      optional: true,
      autoValue: function() {
        return false;
      }
    },
    isDelegate: {
      type: Boolean,
      optional: true,
      autoValue: function() {
        return false;
      }
    },
    isCandidate: {
      type: Boolean,
      optional: true
    },
    isOrganisation: {
      type: Boolean,
      optional: true
    },
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
