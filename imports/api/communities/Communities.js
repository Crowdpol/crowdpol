import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';

export const Communities = new Meteor.Collection('communities');

CommunitySettings = new SimpleSchema({
    /*
        These settings will include all customisable options: 
        colour scheme choice, logo and homepage images,
        about page text, homepage text, default language, 
        option to switch languages
    */
    /*logoUrl: {
        type: String,
        optional: true,
    },
    imageUrl: {
        type: String,
        optional: true
    }*/
});

Community = new SimpleSchema({
    name: {
        type: String,
        optional: false
    },
    subdomain: {
        /* e.g. the URL http://bangor.socialsystems.io has subdomain "bangor" */
        type: String,
        optional: false,
        unique: true
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


