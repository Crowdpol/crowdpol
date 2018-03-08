import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';

export const Communities = new Meteor.Collection('communities');

CommunitySettings = new SimpleSchema({
    /*
        These settings include all customisable options
    */
    colorScheme: {
        type: String,
        optional: true,
        allowedValues: ['default', 'greyscale'],
        defaultValue: 'default'
    },
    logoUrl: {
        type: String,
        optional: true,
    },
    homepageImageUrl: {
        type: String,
        optional: true
    },
    homepageText: {
        type: String,
        optional: true
    },
    homepageTagline: {
        type: String,
        optional: true
    },
    aboutText: {
        type: String,
        optional: true
    },
    languageSelector: {
      type: Boolean,
      autoValue() {
          if (this.isInsert) {
            return false;
          }
      }
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
        optional: false
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


