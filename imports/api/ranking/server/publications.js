import { Meteor } from 'meteor/meteor';
import { Ranks } from '../Ranks.js';

Meteor.publish('ranks.all', function() {
  return Ranks.find();
});
