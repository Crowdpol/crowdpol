import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Maps = new Mongo.Collection('maps');

MapProperties = new SimpleSchema({
  key: {
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
  rootMap: {
    type: String,
    optional: true
  },
  communityId: {
    type: String,
    optional: true
  },
  rootCommunityId: {
    type: String,
    optional: true
  },
  name: {
    type: String,
    optional: true
  }
});

GeocoordsSchema = new SimpleSchema({
  lng: {
    type : Number,
    //decimal: true,
    min: -180,
    max: 180
  },
  lat: {
    type : Number,
    //decimal: true,
    min: -90,
    max: 90
  }
});

MapGeometry = new SimpleSchema({
  type: {
      type: String,
      optional: true,
      allowedValues: ["Point","LineString","Polygon","MultiPoint","MultiLineString","MultiPolygon"],
      defaultValue: "Polygon"
  },
  /*
  //"geoframes.$": {type: String, blackbox:true}
  coordinates: {
    type: SimpleSchema.oneOf(String, { type: Array, blackbox: true })
  }
  */
  coordinates: {
    type: Array,
    optional: true,
  },
  "coordinates.$": {
    type: Array
  },
  "coordinates.$.$": {
    type: Array
  }
  ,
  "coordinates.$.$.$": {
    type: Number
  },
  multiCoordinates: {
    type: Array,
    optional: true,
  },
  "multiCoordinates.$": {
    type: Array
  },
  "multiCoordinates.$.$": {
    type: Array
  },
  "multiCoordinates.$.$.$": {
    type: Array
  },
  "multiCoordinates.$.$.$.$": {
    type: Number
  }
  /*
  coordinates:{
    type: Object,
    blackbox: true
  },*/

  /*
  "coordinates.$": {
    type: GeocoordsSchema,
    optional: true
  },
  coordinates: {
    type: Array,
    optional: true,
  },
  */
});

const MapSchema = new SimpleSchema({
  type: {
      type: String,
      optional: true,
      allowedValues: ["Feature"],
      defaultValue: "Feature"
  },
  properties: {
      type: MapProperties,
      optional: true,
  },

  geometry: {
      type: MapGeometry,
      optional: true
  },
  /*
  geometry: {
    type: Object,
    optional: true,
    blackbox: true
  },
  */
  lastUpdate: {
    //Last update
    type: Date,
    optional: true,
    autoValue: function () {
      return new Date();
    }
  }
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
