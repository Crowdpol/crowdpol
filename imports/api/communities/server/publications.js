import { Meteor } from 'meteor/meteor';
import { Communities } from '../Communities.js';

// on the server

Meteor.publish('communities.all', function() {
  return Communities.find({});
});
