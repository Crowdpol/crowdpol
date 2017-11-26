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

//permissions
Tags.allow({
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

Tags.deny({
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
