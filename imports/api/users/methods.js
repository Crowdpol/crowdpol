import { Meteor } from 'meteor/meteor';

Meteor.methods({
	'deleteUser'(userId) {
		Meteor.users.remove({_id:userId});
	},

	'createEntity'(entity) {
		entityId = Accounts.createUser({
			'email': entity.email,
			'password': entity.password,
			'profile.firstName': entity.name,
			'profile.website': entity.website,
			'profile.phoneNumber': entity.phone,
			'profile.contactPerson': entity.contact
			});

		Roles.addUsersToRoles(entityId, entity.roles);
	}
});