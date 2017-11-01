// All links-related publications

import { Meteor } from 'meteor/meteor';
import { Users } from '../Users.js';

Meteor.publish('users.all', function () {
  return Meteor.users.find();
});
