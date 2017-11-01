import { Meteor } from 'meteor/meteor';

Meteor.methods({
	'deleteUser'(userId) {
		Meteor.users.remove({_id:userId});
	}
});