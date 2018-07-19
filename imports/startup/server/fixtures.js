// Fill the DB with example data on startup

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Proposals } from '../../api/proposals/Proposals.js'
import { Communities } from '../../api/communities/Communities.js'

Meteor.startup(() => {
	/* About text for the communities */
	bgAbout = `Our High Street is facing decline and we need to innovate. A strong step towards innovation can start with the question 'What if?'
Elop has brought together twenty bright young minds from all over the world to ask that question. Taking on trends in living and working in the digital age, absorbing local information and the culture of the place. Multidisciplinary teams, made up of Architects and Sociologists, Engineers and Psychologists have put together four visions of what the High Street could be, based in the reality of what is here and now.
At the core of each vision are the people who will live and work on a thriving High Street in a future Bangor. Taking Wellness and coliving as key principles for the brief, with a sprinkling of autonomous transport. Centred on specific sites in the City centre, acting as kernels for regeneration, pushing out towards a realistic future.`

	mdAbout = `Mer Demokrati är ett projekt öppet för alla politik- och samhällsintresserade människor som vill skapa en personlig politisk plattform inför valet 2018 och se hur den stämmer överens med olika partiers. För att göra detta använder vi så kallad flytande demokrati där besökare kan välja att delegera sin röst till någon annan eller själv rösta direkt på ett antal motioner, eller en kombination av de båda. För den som har förslag på motioner går det även att skriva egna och skicka in dem till vår redaktion som kommer lägga ut två nya motioner i veckan. Projektet löper fram till Internatuonella Demokratidagen den 15e september i år.

Målet är att ge väljarna en upplevelse om hur demokrati skulle kunna fungera i vårt moderan, digitala samhälle, men även att bjuda in till en djupare analys och förståelse av de utmaningar samhället står inför detta valår, samt hur våra politiska partier ställer sig till dem. Slutligen är målet att informera våra riksdagsledamöter om hur ett förhoppningsvis representativt axplock av sveriges medborgare ställer sig till diverse olika politiska områden i hopp om att skapa en djupare dialog och ett fördjupat förtroende.

Efter projektets slutdatum kommer de tio motioner med bredast folkligt stöd att presenteras för demokratiministern men även riksdagens ledamöter kommer individuellt att bjudas in för att kommentera och ta ställning.`
	/* Create two communities */;
	mdSubdomain = 'merdemokrati';
	mdLanguages = ['en', 'sv'];
	mdId = createCommunity('Merdemokrati', mdSubdomain, {
		colorScheme: 'default',
		homepageImageUrl: 'img/wave-bg.jpg',
		languageSelector: true,
		homepageBannerText: "A new wave of democracy is coming to Sweden.",
		homepageIntroText: "A liquid democracy platform for the Swedish Political system.",
		aboutText: mdAbout,
		defaultLanguage: 'sv',
		languages: mdLanguages
	});
	bgSubdomain = 'bangor';
	bgLanguages = ['en','cy'];
	bgId = createCommunity('elop*10', 'bangor', {
		colorScheme: 'greyscale', 
		homepageImageUrl: 'img/bangor.jpg', 
		languageSelector: true,
		homepageBannerText: "Innovation can start with the question 'What if?'",
		homepageIntroText: "A public presentation of four visions of a future High Street.",
		aboutText: bgAbout,
		defaultLanguage: 'en',
		languages: bgLanguages
	});
	cpSubdomain = 'global';
	cpLanguages = ['en'];
	cpId = createCommunity('Crowdpol Global', 'global', {
		colorScheme: 'default', 
		homepageImageUrl: 'img/wave-bg.jpg',
		languageSelector: true,
		homepageBannerText: "A new wave of democracy is coming.",
		homepageIntroText: "A liquid democracy platform for the collective decision making in the commons.",
		aboutText: "Crowdpol about us page",
		defaultLanguage: 'en',
		languages: cpLanguages
	});
	cpLanguages = ['en,ja'];
	cpId = createCommunity('Crowdpol Japan', 'japan', {
		colorScheme: 'default', 
		homepageImageUrl: 'img/wave-bg.jpg',
		languageSelector: true,
		homepageBannerText: "A new wave of democracy is coming.",
		homepageIntroText: "A liquid democracy platform for the collective decision making in the commons.",
		aboutText: "Crowdpol Japan about us page, coming soon.",
		defaultLanguage: 'en',
		languages: cpLanguages
	});

	/* Register admins for both communities */
	registerAdmins([mdId, bgId,cpId]);

	/* Create demo tags for each community */
	createDemoTags(mdId);
	createDemoTags(bgId);
	createDemoTags(cpId);

	/* Create demo users if in dev environment */
	if (Meteor.isDevelopment) {
		registerDemoUsers(Meteor.settings.private.demoUsers, [mdId], mdSubdomain);
		registerDemoUsers(Meteor.settings.private.demoUsers, [bgId], bgSubdomain);
		registerDemoUsers(Meteor.settings.private.demoUsers, [cpId], cpSubdomain);
	}
	
	/* Create demo proposals if in dev environment */
	if (Meteor.isDevelopment) {
		createDemoProposal(mdId, mdSubdomain, mdLanguages);
		createDemoProposal(bgId, bgSubdomain, bgLanguages);
		createDemoProposal(cpId, cpSubdomain, cpLanguages);
	}

	/* Convert existing proposals to new format*/
	convertProposals();

	
});

function registerAdmins(communityIds){
	console.log('Registering admins');
	var admins = Meteor.settings.private.admins;
	for(var x = 0; x < admins.length; x++){
		createAdmins(admins[x], communityIds);
	}
}

createAdmins = function (admin, communityIds) {
	if (!Accounts.findUserByEmail(admin.email)){
		var id = Accounts.createUser({
			username: admin.username,
			email : admin.email,
			password : "123456",
			isPublic: admin.isPublic,
			profile: {
				communityIds: communityIds,
				adminCommunities: communityIds,
				username: admin.profile.username,
				firstName: admin.profile.firstName,
				lastName: admin.profile.lastName,
				photo: admin.profile.photo,
				termsAccepted: true,
				credentials : [
				{
					"source" : "default",
					"URL" : "https://www.crowdpol.org/",
					"validated" : true
				}
				],
				termsAccepted: true
			}
		});

		if (admin.roles.length > 0) {
		    // Need _id of existing user record so this call must come
		    // after `Accounts.createUser` or `Accounts.onCreate`
		    Roles.addUsersToRoles(id, admin.roles);
		}
		console.log('Created admin ' + admin.email);
	} else {
		console.log('Admin with email ' + admin.email + ' already exists.')
	}
};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function createDemoTags(communityId){
	var tags = ['Environment', 'Economics', 'Gender', 'Food-security', 'Technology'];
	_.each(tags, function(text){ Meteor.call('addTag', text, communityId) });

}

function registerDemoUsers(numUsers, communityIds, subdomain){
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
			    if(response){
			    	createDemoUsers(response, communityIds, subdomain);
			    }else{
			    	console.log("Error: Could not generate random users.");
			    }
				
			  }
			});
	}
}

function createDemoUsers(users, communityIds, subdomain){
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
			 	var tag = Meteor.call('getTagByKeyword', keyword, communityIds[0]);
			 	return {"_id": tag._id, "text": tag.text, "keyword": tag.keyword, "url": tag.url};
			 })

			try {
				var id = Accounts.createUser({
				username: Random.id(),
				email : users[x].email,
				password : "123456",
				isPublic: true,
				profile: {
					communityIds: communityIds,
					username: users[x].login.username,
					firstName: users[x].name.first + ' ' + subdomain,
					lastName: users[x].name.last,
					photo: users[x].picture.large,
					type: type,
					tags: tagObjects,
					termsAccepted: true,
					credentials : [
						{
							"source" : "default",
							"URL" : "https://www.commondemocracy.org/",
							"validated" : true
						}
					],
					termsAccepted: true
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

function createDemoProposal(communityId, subdomain, languages){

	var tagObjects = _.map(['environment', 'gender'], function(keyword){
		var tag = Meteor.call('getTagByKeyword', keyword, communityId);
		return {"_id": tag._id, "text": tag.text, "keyword": tag.keyword, "url": tag.url};
	});

	content = [];

	languages.forEach( function (language) {
		var translation = {
			language: language,
			title: language + ' Demo Proposal for ' + subdomain,
			abstract: language + ' Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras ante ligula, tempor et risus feugiat, posuere semper enim. Etiam eleifend lacus a libero blandit, a placerat felis aliquam.',
			body: language + ' Praesent at laoreet risus. Mauris eleifend nunc quis orci venenatis vestibulum. Nam ante elit, bibendum sed tempus sed, bibendum eget lorem. Interdum et malesuada fames ac ante ipsum primis in faucibus.',
			tags: tagObjects
		}
		content.push(translation)
	});

	var title = languages[0] + ' Demo Proposal for ' + subdomain;
	if (Proposals.find({'content.title': title}).count() < 1){
		var user = Accounts.findUserByEmail("trudie@socialsystems.io");
		var proposal = {
			content: content,
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

function convertProposals() {
	proposals = Proposals.find();
	/*
	proposals.forEach(function(proposal){
		if (!proposal.content){
			console.log('converting proposal with id ' + proposal._id + ' to new format');
			var defaultLanguage = Communities.findOne({_id: proposal.communityId}).settings.defaultLanguage;
			//Get content
			var title = proposal.title;
			var abstract = proposal.abstract;
			var body = proposal.body;
			var pointsFor = proposal.pointsFor;
			var pointsAgainst = proposal.pointsAgainst;
			// Remove fields
			Proposals.update({_id: proposal._id}, {$unset: {title:1, body: 1, abstract: 1, pointsAgainst: 1, pointsFor: 1}});
			// Create content
			var content = [{
				language: defaultLanguage,
				title: title,
				abstract: abstract,
				body: body,
				pointsFor: pointsFor,
				pointsAgainst: pointsAgainst
			}];
			Proposals.update({_id: proposal._id}, {$set: {content:content}});
			console.log('finished converting proposal')
		}
	});
	*/
}