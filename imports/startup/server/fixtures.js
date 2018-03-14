// Fill the DB with example data on startup

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Proposals } from '../../api/proposals/Proposals.js'
import { Communities } from '../../api/communities/Communities.js'

Meteor.startup(() => {
	/* Create two communities */;
	mdSubdomain = 'merdemokrati'
	mdId = createCommunity('Merdemokrati', mdSubdomain, {
		colorScheme: 'default',
		homepageImageUrl: 'img/waves-bg.jpg',
		languageSelector: true,
		homepageBannerText: "A new wave of democracy is coming to Sweden.",
		homepageIntroText: "A liquid democracy platform for the Swedish Political system.",
		aboutText: "About the merdemokrati project"
	});
	bgSubdomain = 'bangor';
	bgId = createCommunity('elop*10', 'bangor', {
		colorScheme: 'greyscale', 
		homepageImageUrl: 'img/bangor.jpg', 
		languageSelector: false,
		homepageBannerText: "Innovation can start with the question 'What if?'",
		homepageIntroText: "A public presentation of four visions of a future High Street.",
		aboutText: "About the elop*10 project"
	});

	/* Register admins for each community */
	registerAdmins(mdId, mdSubdomain);
	registerAdmins(bgId, bgSubdomain);

	/* Create demo tags for each community */
	createDemoTags(mdId);
	createDemoTags(bgId);

	/* Create demo users if in dev environment */
	if (Meteor.isDevelopment) {
		registerDemoUsers(Meteor.settings.private.demoUsers, mdId, mdSubdomain);
		registerDemoUsers(Meteor.settings.private.demoUsers, bgId, bgSubdomain);
	}
	
	/* Create demo proposals if in dev environment */
	if (Meteor.isDevelopment) {
		createDemoProposal(mdId, mdSubdomain);
		createDemoProposal(bgId, bgSubdomain);
	}
});

function registerAdmins(communityId, subdomain){
	console.log('Registering admins for ' + subdomain);
	var admins = Meteor.settings.private.admins;
	for(var x = 0; x < admins.length; x++){
		createAdmins(admins[x], communityId, subdomain);
	}
}

createAdmins = function (admin, communityId, communitySubdomain) {
	var email = admin.email.split('@')
	email = email[0] + '+' + communitySubdomain + '@' + email[1];
	if (!Accounts.findUserByEmail(email)){
		var id = Accounts.createUser({
			username: admin.username + '_' + communitySubdomain,
			email : email,
			password : "123456",
			isPublic: admin.isPublic,
			profile: {
				communityId: communityId,
				communitySubdomain: communitySubdomain,
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
		console.log('Created admin ' + email);
	} else {
		console.log('Admin with email ' + email + ' already exists.')
	}
};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function createDemoTags(communityId){
	var tags = ['Environment', 'Economics', 'Gender', 'Food-security', 'Technology'];
	_.each(tags, function(text){ Meteor.call('addTag', text, communityId) });

}

function registerDemoUsers(numUsers, communityId, subdomain){
	let demoUserCount = Roles.getUsersInRole('demo').count();
	if(demoUserCount>=numUsers){
		console.log("Already created demo users for " + subdomain);
	}else{
		let url = 'https://randomuser.me/api/?nat=gb&results=' + numUsers;
		let response = [];
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
			    response = response.data.results;
				createDemoUsers(response, communityId, subdomain);
			  }
			});
		
	}
}

function createDemoUsers(users, communityId, subdomain){
	var successCount = 0;
	for(var x = 0; x < users.length; x++){
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
			    	roles = ["delegate" ,"candidate","individual","demo"];
			    	type = 'Individual';
			    	keywords = ['environment']
			        break;
			    default:

			 }

			 var tagObjects = _.map(keywords, function(keyword){
			 	var tag = Meteor.call('getTagByKeyword', keyword);
			 	return {"_id": tag._id, "text": tag.text, "keyword": tag.keyword, "url": tag.url};
			 })

			try {
				var id = Accounts.createUser({
				username: Random.id(),
				email : users[x].email,
				password : "123456",
				isPublic: true,
				profile: {
					communityId: communityId,
					communitySubdomain: subdomain,
					username: users[x].login.username,
					firstName: users[x].name.first + ' ' + subdomain,
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
			} catch (e) {
				console.log("[" + e.error + "] " + e.reason);
			}

			if (roles.length>0) {
		    	Roles.addUsersToRoles(id, roles);
		    }
		    Meteor.call('togglePublic', id, true);
		    successCount+=1;
		
	}
	console.log(successCount + " demo users generated.");
}

function createDemoProposal(communityId, subdomain){

	var tagObjects = _.map(['environment', 'gender'], function(keyword){
		var tag = Meteor.call('getTagByKeyword', keyword);
		return {"_id": tag._id, "text": tag.text, "keyword": tag.keyword, "url": tag.url};
	})

	var title = 'Demo Proposal for ' + subdomain;

	if (Proposals.find({title: title}).count() < 1){
		var user = Accounts.findUserByEmail("trudie+" + subdomain + "@socialsystems.io");
		var proposal = {
			title: title,
			abstract: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras ante ligula, tempor et risus feugiat, posuere semper enim. Etiam eleifend lacus a libero blandit, a placerat felis aliquam.',
			body: 'Praesent at laoreet risus. Mauris eleifend nunc quis orci venenatis vestibulum. Nam ante elit, bibendum sed tempus sed, bibendum eget lorem. Interdum et malesuada fames ac ante ipsum primis in faucibus.',
			startDate: moment().subtract(3, 'days').toDate(),
			endDate: moment().add(1, 'years').toDate(),
			tags: tagObjects,
			authorId: user._id,
			communityId: communityId,
			stage: 'live',
			status: 'approved'
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