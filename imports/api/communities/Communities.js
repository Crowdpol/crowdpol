import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';

export const Communities = new Meteor.Collection('communities');

CommunityMap = new SimpleSchema({
  type: {
      type: String,
      optional: true,
      allowedValues: ['map','url'],
      defaultValue: 'map'
  },
  geosjon: {
     //URL that identifies this map
    type: String,
    optional: true,
  }
});

CommunityMembers = new SimpleSchema({
    /*
        These settings include all customisable options
    */
    ambassador: {
        type: String,
        optional: true,
    },
    admins: {
      type: Array,
      optional: true,
    },
    "admins.$": {
      type: String,
      optional: true
    },
    members: {
      type: Array,
      optional: true,
    },
    "members.$": {
      type: String,
      optional: true
    },
    members: {
      type: Array,
      optional: true,
    },
    "members.$": {
      type: String,
      optional: true
    }
});

CommunitySettings = new SimpleSchema({
    /*
        These settings include all customisable options
    */
    contactEmail: {
        type: String,
        optional: true,
    },
    colorScheme: {
        type: String,
        optional: true,
        allowedValues: ['default', 'greyscale','syntropi'],
        defaultValue: 'default'
    },
    logoUrl: {
        type: String,
        optional: true,
    },
    faviconUrl: {
        type: String,
        optional: true,
    },
    homepageImageUrl: {
        type: String,
        optional: true
    },
    homepageBannerText: {
        type: String,
        optional: true
    },
    homepageIntroText: {
        type: String,
        optional: true
    },
    aboutText: {
        type: String,
        optional: true
    },
    languageSelector: {
      type: Boolean,
      optional: false,
      defaultValue: false
    },
    defaultLanguage: {
      type: String,
      optional: false,
      allowedValues: ['en', 'sv'],
      defaultValue: 'en'
    },
    languages: {
      type: Array,
      optional: false,
    },
    "languages.$": {
      type: String,
      optional: false
    },
    emailWhitelist: {
      type: Array,
      optional: true,
    },
    "emailWhitelist.$": {
      type: String,
      optional: true
    },
    enforceWhitelist: {
      type: Boolean,
      optional: false,
      defaultValue: false
    },
    showDates: {
      type: Boolean,
      optional: false,
      defaultValue: true
    },
    defaultStartDate: {
      type: Date,
      optional: true
    },
    defaultEndDate: {
      type: Date,
      optional: true
    },
    delegateLimit: {
      type: Number,
      optional: true
    },
    collaboratorLimit: {
      type: Number,
      optional: true
    }

});

Community = new SimpleSchema({
    name: {
        type: String,
        optional: false
    },
    subdomain: {
        /* e.g. the URL http://bangor.socialsystems.io has subdomain "bangor" */
        type: String,
        optional: true
    },
    key:{
        type: String,
        optional: true
    },
    isRoot: {
      type: Boolean,
      optional: false,
      defaultValue: false
    },
    parentCommunity: {
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
    },
    settings: {
        type: CommunitySettings,
        optional: true
    },
    members: {
        type: CommunityMembers,
        optional: true
    },
    map: {
      type: CommunityMap,
      optional: true
    },
    isArchived: {
      type: Boolean,
      optional: true,
      defaultValue: false
    },
    archiveDate: {
      type: Date,
      optional: true
    }
});

Communities.attachSchema(Community);

Communities.allow({
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

Communities.deny({
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
