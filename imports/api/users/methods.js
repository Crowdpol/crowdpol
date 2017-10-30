import { Meteor } from 'meteor/meteor';

Meteor.methods({
	'user.archive'(userId) {
		//flag user as archived
		Roles.addUsersToRoles(userId, ['archived']);
	},
	'user.restore'(userId) {
		//remove archive flag
		Roles.removeUsersFromRoles(userId, ['archived']);
	}
});