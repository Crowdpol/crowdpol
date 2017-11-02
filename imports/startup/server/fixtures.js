// Fill the DB with example data on startup

import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  //register administrators
  registerAdmins();
});

function registerAdmins(){
	var admins = Meteor.settings.private.defaultUsers;
	for(var x = 0; x < admins.length; x++){
		createAdmins(admins[x]);
	}
	
}

createAdmins= function (admin) {
	//var usernameFound = checkUsernameExists();
	//var usernameFound = checkUserEmailExists();
	try{
		var id = Accounts.createUser({
			username: admin.username,
			email : admin.email,
			password : "123456",
			isPublic: admin.isPublic,
			profile: {
				username: admin.profile.username,
				firstName: admin.profile.firstName,
				lastName: admin.profile.lastName,
				photo: admin.profile.photo,
				credentials : [
					{
						"source" : "default",
						"URL" : "https://www.commondemocracy.org/",
						"validated" : true
					}
				]
			}
		});

		if (admin.roles.length > 0) {
	    // Need _id of existing user record so this call must come
	    // after `Accounts.createUser` or `Accounts.onCreate`
	    Roles.addUsersToRoles(id, admin.roles);
	  }
	} catch (e) {
		//throw new Meteor.Error(e);
		console.log("[" + e.error + "] " + admin.email + ": " + e.reason);
	}
};
