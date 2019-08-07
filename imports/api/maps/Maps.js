import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Maps = new Mongo.Collection('maps');

const MapSchema = new SimpleSchema({
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
  },
  url: {
     //URL that identifies this map
    type: String,
    optional: true,
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
  communityId: {
    type: String,
    optional: false
  },
  rootCommunityId: {
    type: String,
    optional: false
  },
});

Maps.attachSchema(MapSchema);

//permissions
Maps.allow({
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

Maps.deny({
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
