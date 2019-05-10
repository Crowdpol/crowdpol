// Fill the DB with example data on startup

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Proposals } from '../../api/proposals/Proposals.js'
import { Communities } from '../../api/communities/Communities.js'

Meteor.startup(() => {
	/*
	let communityTemplate = {
		name: 'name',
    subdomain: //'subdomain',
    isRoot: //true/false,
    parentCommunity: '_id',
    settings :{
			contactEmail: //'hello@crowdpol.com',
			colorScheme: //['default', 'greyscale','syntropi'],
			logoUrl: //URL,
			faviconUrl: //URL,
			homepageImageUrl: //URL,
			homepageBannerText: ''
			homepageIntroText: '',
			aboutText: '',
			languageSelector: //true/false,
			defaultLanguage: 'en'
			languages: [],
			emailWhitelist: [],
			enforceWhitelist: //true/false,
			showDates: //true/false,
			defaultStartDate: //date,
			defaultEndDate: //date,
			delegateLimit: 5,
			collaboratorLimit: 5
		}
	}
	*/
	let globalCommunity = {
	    name: 'Crowdpol Global',
	    subdomain: 'global',
	    isRoot: true,
	    parentCommunity: '',
	    settings: {
				contactEmail: 'hello@crowdpol.com',
				colorScheme: 'default',
				logoUrl: '',//URL,
				faviconUrl: 'img/syntropi_grey.jpg',
				homepageImageUrl: 'img/syntropi_grey.jpg',
				homepageBannerText: 'A new wave of democracy is coming.',
				homepageIntroText: 'A liquid democracy platform for the collective decision making in the commons.',
				aboutText: 'Crowdpol about us page',
				languageSelector: true,
				defaultLanguage: 'en',
				languages: ['en','ja','cy','sv'],
				emailWhitelist: [],
				enforceWhitelist: true,
				showDates: true,
				delegateLimit: 5,
				collaboratorLimit: 5
			}
	};

	let demoCommunity = {
			name: 'Crowdpol Demo',
			subdomain: 'demo',
	    isRoot: true,
	    parentCommunity: '',
	    settings: {
				contactEmail: 'hello@crowdpol.com',
				colorScheme: 'default',
				logoUrl: '',//URL,
				faviconUrl: '',//'img/syntropi_grey.jpg',
				homepageImageUrl: 'img/syntropi_grey.jpg',
				homepageBannerText: 'A new wave of democracy is coming.',
				homepageIntroText: 'A liquid democracy platform for the collective decision making in the commons.',
				aboutText: 'Crowdpol about us page',
				languageSelector: true,
				defaultLanguage: 'en',
				languages: ['en','ja','cy','sv'],
				emailWhitelist: [],
				enforceWhitelist: true,
				showDates: true,
				delegateLimit: 5,
				collaboratorLimit: 5
			}
	}
	let globalId = createCommunity(globalCommunity);
	let demoId = createCommunity(demoCommunity);

	let swedishCommunity = {
	    name: 'Crowdpol Sweden',
	    subdomain: '',
	    isRoot: false,
	    parentCommunity: globalId,
	    settings: {
				contactEmail: 'hello@crowdpol.com',
				colorScheme: 'default',
				logoUrl: '',//URL,
				faviconUrl: 'img/syntropi_grey.jpg',
				homepageImageUrl: 'img/syntropi_grey.jpg',
				homepageBannerText: 'A new wave of democracy is coming.',
				homepageIntroText: 'A liquid democracy platform for the collective decision making in the commons.',
				aboutText: 'Crowdpol about us page',
				languageSelector: true,
				defaultLanguage: 'sv',
				languages: ['en','sv'],
				emailWhitelist: [],
				enforceWhitelist: true,
				showDates: true,
				delegateLimit: 5,
				collaboratorLimit: 5
			}
	};

	/* Register admins for both communities */
	registerAdmins([globalId,demoId]);

	/* Create demo tags for each community */
	createDemoTags(globalId);
	createDemoTags(demoId);
	/* Create demo users if in dev environment */
	if (Meteor.isDevelopment) {
		registerDemoUsers(Meteor.settings.private.demoUsers, [globalId,demoId]);
	}

	/* Create demo proposals if in dev environment */
	if (Meteor.isDevelopment) {
		createDemoProposal(globalId, globalCommunity.settings.languages);
	}

	/* Convert existing proposals to new format*/
	convertProposals();


});

function createCommunity(community){
	var existing = Communities.findOne({subdomain: community.name});
	if (!existing){
		console.log('Creating community ' + community.name);
		return Communities.insert(community);
	} else {
		console.log(community.name + ' Community already exists.')
		return existing._id;
	}

}

function registerAdmins(communityIds){
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
		//console.log('Created admin ' + admin.email);
	} else {
		//console.log('Admin with email ' + admin.email + ' already exists.')
	}
};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function createDemoTags(communityId){
	var tags = ['Environment', 'Economics', 'Gender', 'Food-security', 'Technology'];
	_.each(tags, function(text){ Meteor.call('addTag', text, communityId) });

}

function registerDemoUsers(numUsers, communityIds){
	let demoUserCount = Roles.getUsersInRole('demo').count();
	if(demoUserCount>=numUsers){
		//console.log("Already created demo users for " + subdomain);
	}else{
		let url = 'https://randomuser.me/api/?nat=gb&results=' + numUsers;
		let response = [];
			HTTP.call( 'GET', url, {}, function( error, response ) {
			  if ( error ) {
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
			    	createDemoUsers(response, communityIds);
			    }else{
			    	console.log("Error: Could not generate random users.");
			    }

			  }
			});
	}
}

function createDemoUsers(users, communityIds){
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
					firstName: users[x].name.first,
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

function createDemoProposal(communityId, languages){

	var tagObjects = _.map(['environment', 'gender'], function(keyword){
		var tag = Meteor.call('getTagByKeyword', keyword, communityId);
		return {"_id": tag._id, "text": tag.text, "keyword": tag.keyword, "url": tag.url};
	});

	content = [];

	languages.forEach( function (language) {
		var translation = {
			language: language,
			title: language + ' Demo Proposal',
			abstract: language + ' Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras ante ligula, tempor et risus feugiat, posuere semper enim. Etiam eleifend lacus a libero blandit, a placerat felis aliquam.',
			body: language + ' Praesent at laoreet risus. Mauris eleifend nunc quis orci venenatis vestibulum. Nam ante elit, bibendum sed tempus sed, bibendum eget lorem. Interdum et malesuada fames ac ante ipsum primis in faucibus.',
			tags: tagObjects,
			pointsFor: ['point for one','point for two'],
			pointsAgainst: ['point for one','point for two'],
			argumentsFor:[
				{
					argumentId: Random.id(),
					type: 'for',
					message: 'sample for message - sv',
					authorId: 'Ba6WhQRTSxCGBTNMY',
					createdAt: moment().format('YYYY-MM-DD'),
					lastModified: moment().format('YYYY-MM-DD'),
					upVote: ['123','321'],
					downVote: ['321','123'],
					language:'sv'
				},
				{
					argumentId: Random.id(),
					type: 'for',
					message: 'sample for message - en',
					authorId: 'pQmkc7Rtpg3Yoajqi',
					createdAt: moment().format('YYYY-MM-DD'),
					lastModified: moment().format('YYYY-MM-DD'),
					upVote: ['123','321'],
					downVote: ['321','123'],
					language:'en'
				}
			],
			argumentsAgainst:[
				{
					argumentId: Random.id(),
					type: 'against',
					message: 'sample against message - sv',
					authorId: 'acYAwSGKCwrnRvg57',
					createdAt: moment().format('YYYY-MM-DD'),
					lastModified: moment().format('YYYY-MM-DD'),
					upVote: ['456','654'],
					downVote: ['1','2'],
					language:'sv'
				},
				{
					argumentId: Random.id(),
					type: 'against',
					message: 'sample against message - en',
					authorId: 'pQmkc7Rtpg3Yoajqi',
					createdAt: moment().format('YYYY-MM-DD'),
					lastModified: moment().format('YYYY-MM-DD'),
					upVote: ['123','321'],
					downVote: ['3','1'],
					language:'en'
				}
			]
		}
		content.push(translation)
	});

	var title = languages[0] + ' Demo Proposal';
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



function convertProposals() {
	proposals = Proposals.find();
	/*
	proposals.forEach(function(proposal){
		if (!proposal.content){
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
		}
	});
	*/
}
