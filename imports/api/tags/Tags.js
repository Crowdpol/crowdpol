import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { convertToSlug } from '../../utils/functions';

export const Tags = new Mongo.Collection('tags');

const TagSchema = new SimpleSchema({
  text: {
    // Tag name
    type: String,
    optional: false
  },
  keyword: {
    // Unique identifier in DB as keyword-based-slug
    type: String,
    optional: true,
    autoValue: function() {
      if (this.isInsert) {
        return convertToSlug(this.field('text').value);
      };
    }
  },
  url: {
     //URL that identifies this tag
    type: String,
    optional: true,
    autoValue: function () {
      if (this.isInsert) {
        return '/tag/' + convertToSlug(this.field("text").value);
      }
    }
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
  },
  authorized: {
    //This tag has been authorized
    type: Boolean,
    optional: true,
    autoValue: function () {
      if (this.isInsert) {
        return true;
      }
    }
  }
});

Tags.attachSchema(TagSchema);

/*
*  FIX: temporary workaround
*  TBD: apply security best practices
*  All to methods, validate paramenters
*/
//permissions
Tags.allow({
  insert: function (userId) {
    if (userId) {
      return true;
    }
    return false;
  },
  update: function (userId) {
    console.log("checking users update permissions");
    if (userId) {
      console.log("tag update permitted");
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
