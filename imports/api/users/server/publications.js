import { Meteor } from 'meteor/meteor';

// on the server
Meteor.publish('users', function() {
	return  Meteor.users.find({}, {fields: {services: false}});
});