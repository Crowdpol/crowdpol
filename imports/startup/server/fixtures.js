// Fill the DB with example data on startup

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Proposals } from '../../api/proposals/Proposals.js'
import { Communities } from '../../api/communities/Communities.js'

Meteor.startup(() => {
  //register administrators
  devCommunityId = createCommunity('Development', 'dev', {colorScheme: 'default', languageSelector: false});
  createCommunity('Bangor', 'bangor', {colorScheme: 'greyscale', languageSelector: false});
  createDemoTags();
  registerAdmins();
  registerDemoUsers(Meteor.settings.private.demoUsers);
  createDemoProposal();
});

function registerAdmins(){
	var admins = Meteor.settings.private.defaultUsers;
	for(var x = 0; x < admins.length; x++){
		createAdmins(admins[x]);
	}
}

createAdmins= function (admin) {
	try{
		var id = Accounts.createUser({
			username: admin.username,
			email : admin.email,
			password : "123456",
			isPublic: admin.isPublic,
			profile: {
				communityId: devCommunityId,
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

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function createDemoTags(){
	var tags = ['Environment', 'Economics', 'Gender', 'Food-security', 'Technology'];
	_.each(tags, function(text){ Meteor.call('addTag', text) });

}

function createDemoUsers(users){
	var successCount = 0;
	for(var x = 0; x < users.length; x++){
		try{
			//generate random number between 1 and 8
			var num = getRandomInt(0,8);
			var type = '';
			var roles = [];
			var keywords = '';
			switch (num) {
			    case 0:
			        roles = ["candidate","party","demo"];
			        type = 'Entity';
			        keywords = ['environment', 'economics', 'gender', 'food-security', 'technology']
			        break;
			    case 1:
			        roles = ["candidate","organisation","demo"];
			        type = 'Entity';
			        keywords = ['economics']
			        break;
			    case 2:
			        roles = ["delegate","party","demo"];
			        type = 'Entity';
			        keywords = ['gender', 'food-security', 'technology']
			        break;
			    case 3:
			    	roles = ["delegate","organisation","demo"];
			    	type = 'Entity';
			        break;
			    case 4:
			    	roles = ["delegate","candidate","organisation","demo"];
			    	type = 'Entity';
			    	keywords = ['technology']
			        break;
			    case 5:
			    	roles = ["candidate","delegate","party","demo"];
			    	type = 'Entity';
			    	keywords = ['environment']
			        break;
			    case 6:
			    	roles = ["candidate","individual","demo"];
			    	type = 'Individual';
			    	keywords = ['food-security', 'technology']
			        break;
			    case 7:
			    	roles = ["delegate","individual","demo"];
			    	type = 'Individual';
			    	keywords = ['environment','gender']
			        break;
			    case 8:
			    	roles = ["delegate,candidate,individual","demo"];
			    	type = 'Individual';
			    	keywords = ['environment']
			        break;
			    default:

			 }

			 var tagObjects = _.map(keywords, function(keyword){
			 	var tag = Meteor.call('getTagByKeyword', keyword);
			 	return {"_id": tag._id, "text": tag.text, "keyword": tag.keyword, "url": tag.url};
			 })

			var id = Accounts.createUser({
				username: Random.id(),
				email : users[x].email,
				password : "123456",
				isPublic: true,
				profile: {
					communityId: devCommunityId,
					username: users[x].login.username,
					firstName: users[x].name.first,
					lastName: users[x].name.last,
					photo: users[x].picture.large,
					type: type,
					tags: tagObjects,
					credentials : [
						{
							"source" : "default",
							"URL" : "https://www.commondemocracy.org/",
							"validated" : true
						}
					]
				}
			});

			if (roles.length>0) {
		    	Roles.addUsersToRoles(id, roles);
		    }
		    Meteor.call('togglePublic', id, true);
		    successCount+=1;
		} catch (e) {
			//throw new Meteor.Error(e);
			console.log("[" + e.error + "] " + e.reason);
		}
	}
	console.log(successCount + " demo users generated.");
}
function registerDemoUsers(numUsers){
	let demoUserCount = Roles.getUsersInRole('demo').count();
	if(demoUserCount>=numUsers){
		console.log("Already " + demoUserCount + "demo users");
	}else{
		let url = 'https://randomuser.me/api/?nat=gb&results=' + numUsers;
		let response = [];
		try{
			HTTP.call( 'GET', url, {}, function( error, response ) {
			  if ( error ) {
			    console.log( error );
			    return false;
			  } else {
			    /*
			     This will return the HTTP response object that looks something like this:
			     {
			       content: "String of content...",
			       data: Array[100], <-- Our actual data lives here. 
			       headers: {  Object containing HTTP response headers }
			       statusCode: 200
			     }
			    */
			    console.log("Generating " + response.data.results.length + " demo users...");
			    response= response.data.results;
				createDemoUsers(response);
			  }
			});
		} catch (e) {
			console.log(e);
			return false;
		}
	}
}

function createDemoProposal(userId){

	var tagObjects = _.map(['environment', 'gender'], function(keyword){
			 	var tag = Meteor.call('getTagByKeyword', keyword);
			 	return {"_id": tag._id, "text": tag.text, "keyword": tag.keyword, "url": tag.url};
			 })

	if (Proposals.find({title: 'Demo Proposal'}).count() < 1){
		var user = Accounts.findUserByEmail("tspangenberg1@gmail.com");
		var proposal = {
			title: 'Demo Proposal',
			abstract: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras ante ligula, tempor et risus feugiat, posuere semper enim. Etiam eleifend lacus a libero blandit, a placerat felis aliquam.',
			body: 'Praesent at laoreet risus. Mauris eleifend nunc quis orci venenatis vestibulum. Nam ante elit, bibendum sed tempus sed, bibendum eget lorem. Interdum et malesuada fames ac ante ipsum primis in faucibus.',
			startDate: new Date(),
			endDate: new Date(),
			tags: tagObjects,
			authorId: user._id
		};

		Proposals.insert(proposal);
	}
}

function createCommunity(name, subdomain, settings){
	var existing = Communities.findOne({subdomain: subdomain})
	if (!existing){
		console.log('Creating community ' + name);
		return Communities.insert({name: name, subdomain: subdomain, settings: settings})
	} else {
		console.log(name + ' Community already exists.')
		return existing._id;
	}
	
}