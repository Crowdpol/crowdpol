import { Meteor } from 'meteor/meteor';
import { Tags } from '../Tags.js';

Meteor.publish('tags.all', function() {
  return Tags.find();
});
