import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { convertToSlug } from '../../utils/functions';

export const Labels = new Mongo.Collection('labels');

const LabelSchema = new SimpleSchema({
  keyword: {
    // Unique identifier in DB as keyword-based-slug
    type: String,
    optional: false,
    /* probably won't need to slud a label keyword
    autoValue: function () {
      if (this.isInsert) {
        return convertToSlug(this.value);
      }
    }
    */
  },
  description: {
    type: String,
    optional: false,
  },
  /*
  level: {
    type: Number,
    optional: false,

    autoValue: function () {
      if (this.isInsert) {
        return 0;
      }
    }
  },*/
  url: {
     //URL that identifies this label
    type: String,
    optional: true,
    autoValue: function () {
      if (this.isInsert) {
        return '/label/' + convertToSlug(this.field("keyword").value);
      }
      if (this.isUpdate) {
        return '/label/' + convertToSlug(this.field("keyword").value);
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
  "parentLabels": {
			type: Array,
			optional: true
	},
	'parentLabels.$': {
			type: String
	},
  authorized: {
    //This label has been authorized
    type: Boolean,
    optional: true,
    autoValue: function () {
      if (this.isInsert) {
        return false;
      }
    }
  },
  communityId: {
        type: String,
        optional: false
    },
});

Labels.attachSchema(LabelSchema);

//permissions
Labels.allow({
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

Labels.deny({
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
