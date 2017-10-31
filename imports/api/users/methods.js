import { Meteor } from 'meteor/meteor';

Meteor.methods({
	'user.delete'(userId) {
		Meteor.users.remove({_id:userId});
	}
});