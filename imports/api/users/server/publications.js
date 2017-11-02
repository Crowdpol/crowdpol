import { Meteor } from 'meteor/meteor';
import { Users } from '../Users.js';
// on the server
Meteor.publish('users', function() {
	return  Meteor.users.find({}, {fields: {services: false}});
});

Meteor.publish('users.all', function () {
  return Meteor.users.find();
});

