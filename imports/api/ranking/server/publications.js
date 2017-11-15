import { Meteor } from 'meteor/meteor';
import { Ranks } from '../Ranks.js';

Meteor.publish('ranks.all', function() {
  result =  Ranks.find({});
  return result;
});



