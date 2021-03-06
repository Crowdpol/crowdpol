import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';

//NOTE: as recommended in https://github.com/aldeed/meteor-collection2-core#attach-a-schema-to-meteorusers
const Schema = {};

Schema.Approval = new SimpleSchema({
    id: {
        type: String,
        optional: true,
    },
    communityId: {
        type: String,
        optional: true,
    },
    type: {
        type: String,
        allowedValues: ['delegate', 'candidate'],
        optional: true,
    },
    status: {
        type: String,
        allowedValues: ['Requested', 'Approved','Rejected'],
        optional: true,
    },
    reviewedBy: {
        type: String,
        optional: true,
    },
    reviewedOn: {
        type: Date,
        optional: true,
    },
    reviewedReply: {
        type: String,
        optional: true,
    },
    createdAt: {
        type: Date,
        optional: true,
    },
});

Schema.Card = new SimpleSchema({
    flagId: {
        type: String,
        optional: true,
    },
    type: {
        type: String,
        allowedValues: ['yellow', 'red'],
        optional: true,
    },
    status: {
        type: String,
        allowedValues: ['active','expired'],
        optional: true,
    },
    reviewedBy: {
        type: String,
        optional: true,
    },
    reviewedOn: {
        type: Date,
        optional: true,
    },
    reviewedReply: {
        type: String,
        optional: true,
    },
    createdAt: {
        type: Date,
        optional: true,
    },
    expireDate: {
        type: Date,
        optional: true,
    },
});

Schema.Skills = new SimpleSchema({
  type: {
    type: String,
    allowedValues: ['legal','business','marketing','finance','environment','political','management','administration','design','programming'],
    optional: true,
  },
  description: {
    type: String,
    optional: true,
  },
  selected: {
    type: Boolean,
    optional: true,
  },
});

Schema.Interests = new SimpleSchema({
  type: {
    type: String,
    allowedValues: ['culture','finance','defense','education','enterprise','environment','foreign-affairs','social-affairs','infrastructure','justice'],
    optional: true,
  },
  amount: {
    type: Number,
    optional: true,
  },
});

Schema.Credential = new SimpleSchema({
  source: {
    type: String,
    //allowedValues: ['facebook', 'twitter', 'google', 'script', 'default'],
    optional: true,
  },
  url: {
    type: String,
    optional: true,
  },
  validated: {
    type: Boolean,
    optional: true,
  },
});

Schema.Social = new SimpleSchema({
  type: {
    type: String,
    allowedValues: ['facebook', 'twitter', 'google', 'youtube', 'linkedin','instagram','website'],
    optional: true,
  },
  url: {
    type: String,
    //regEx: SimpleSchema.RegEx.Url,
    optional: true,
  },
  validated: {
    type: Boolean,
    optional: true,
  },
  visible: {
    type: Boolean,
    optional: true,
  },
});


Schema.UserCountry = new SimpleSchema({
    name: {
        type: String
    },
    code: {
        type: String,
        regEx: /^[A-Z]{2}$/
    }
});

Schema.UserProfile = new SimpleSchema({
    type: {
        type: String,
        allowedValues: ['Individual', 'Entity'],
        optional: true,
    },
    firstName: {
        type: String,
        optional: true
    },
    lastName: {
        type: String,
        optional: true
    },
    username: {
        type: String,
        optional: true
    },
    photo: {
        type: String,
        optional: true,
    },
    credentials: {
        type: Array,
        optional: true,
    },
    'credentials.$': {
        type: Schema.Credential,
        optional: true,
    },
    birthday: {
        type: Date,
        optional: true
    },
    interests: {
        type: Array,
        optional: true,
    },
    'interests.$': {
        type: Schema.Interests,
        optional: true,
    },
    skills: {
        type: Array,
        optional: true,
    },
    'skills.$': {
        type: Schema.Skills,
        optional: true,
    },
    skillsDescription:{
      type: String,
      optional: true
    },
    social: {
        type: Array,
        optional: true,
    },
    'social.$': {
        type: Schema.Social,
        optional: true,
    },
    bio: {
        type: String,
        optional: true
    },
    motto: {
        type: String,
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
    tags: {
        type: Array,
        optional: true,
    },
    "tags.$": {
        type: String,
        optional: true
    },
    communityIds: {
        type: Array,
        optional: false,
    },
    'communityIds.$': {
        type: String,
        optional: false,
    },
    adminCommunities: {
        type: Array,
        optional: true,
    },
    'adminCommunities.$': {
        type: String,
        optional: true,
    },
    delegateCommunities: {
        type: Array,
        optional: true,
    },
    'delegateCommunities.$': {
        type: String,
        optional: true,
    },
    termsAccepted: {
        type: Boolean,
        optional: false
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
    following: {
        type: Array,
        optional: true,
    },
    "following.$": {
        type: String,
        optional: true
    },
    /*
    birthday: {
        type: Date,
        optional: true
    },
    organization : {
        type: String,
        optional: true
    },
    country: {
        type: Schema.UserCountry,
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
    */
});

Schema.User = new SimpleSchema({
    username: {
        type: String,
        // For accounts-password, either emails or username is required, but not both. It is OK to make this
        // optional here because the accounts-password package does its own validation.
        // Third-party login packages may not require either. Adjust this schema as necessary for your usage.
        optional: true
    },
    emails: {
        type: Array,
        // For accounts-password, either emails or username is required, but not both. It is OK to make this
        // optional here because the accounts-password package does its own validation.
        // Third-party login packages may not require either. Adjust this schema as necessary for your usage.
        optional: true
    },
    "emails.$": {
        type: Object
    },
    "emails.$.address": {
        type: String,
        regEx: SimpleSchema.RegEx.Email
    },
    "emails.$.verified": {
        type: Boolean
    },
    /* Use this registered_emails field if you are using splendido:meteor-accounts-emails-field / splendido:meteor-accounts-meld
    registered_emails: {
        type: Array,
        optional: true
    },

    'registered_emails.$': {
        type: Object,
        blackbox: true
    },
    */
    createdAt: {
        type: Date,
        autoValue() {
          if (this.isInsert) {
            return new Date();
          }
        },
    },
    cards: {
        type: Array,
        optional: true,
    },
    'cards.$': {
        type: Schema.Card,
        optional: true,
    },
    isDisabled: {
        type: Boolean,
        optional: true,
        autoValue() {
          if (this.isInsert) {
            return false;
          }
        },
    },
    isPublic: {
        type: Boolean,
        optional: true,
        autoValue() {
          if (this.isInsert) {
            return false;
          }
        },
    },
    profile: {
        type: Schema.UserProfile,
        optional: true
    },
    // Make sure this services field is in your schema if you're using any of the accounts packages
    services: {
        type: Object,
        optional: true,
        blackbox: true
    },
    approvals: {
        type: Array,
        optional: true,
    },
    'approvals.$': {
        type: Schema.Approval,
        optional: true,
    },
    // Add `roles` to your schema if you use the meteor-roles package.
    // Option 1: Object type
    // If you specify that type as Object, you must also specify the
    // `Roles.GLOBAL_GROUP` group whenever you add a user to a role.
    // Example:
    // Roles.addUsersToRoles(userId, ["admin"], Roles.GLOBAL_GROUP);
    // You can't mix and match adding with and without a group since
    // you will fail validation in some cases.
    roles: {
        type: Object,
        optional: true,
        blackbox: true
    },
    // Option 2: [String] type
    // If you are sure you will never need to use role groups, then
    // you can specify [String] as the type
    roles: {
        type: Array,
        optional: true
    },
    'roles.$': {
        type: String
    },
    // In order to avoid an 'Exception in setInterval callback' from Meteor
    heartbeat: {
        type: Date,
        optional: true
    }
});

Meteor.users.attachSchema(Schema.User);

/*
*  FIX: temporary workaround
*  TBD: apply security best practices
*  All to methods, validate paramenters
*/
// permissions
Meteor.users.allow({
  insert: function (userId) {
    return false;
  },
  update: function (userId) {
    return false;
  },
  remove: function (userId) {
    return false;
  },
});

Meteor.users.deny({
  insert: function (userId) {
    return true;
  },
  update: function (userId) {
    return true;
  },
  remove: function (userId) {
    return true;
  },
});
