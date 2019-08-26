import './users/users.js';
import './tags/tags.js';
import './labels/labels.js';
import './approvals/approvals.js';
import './proposals/proposals.js';
import './voting/voting.js';
import './stats/stats.js';
import './flags/flags.js';
import './dash.html';
import './communities/communities.js'
import './settings/settings.js'
import './maps/maps.js'

Template.registerHelper('currentUserHasAdmin', function(){
	var user = Meteor.user();
	//give super admin and admin full rights
	if (user && Roles.userIsInRole(user, ['admin', 'superadmin'])){
		return true;
	}
	//give community admin rights to the community only
	if (user && Roles.userIsInRole(user, ['community-admin'])){
		var communityId = LocalStore.get('communityId');
		let profile = Meteor.user().profile;
		if(typeof profile.adminCommunities !== 'undefined'){
			let adminCommunities = profile.adminCommunities;
			if(Array.isArray(adminCommunities)){
				if(adminCommunities.includes(communityId)){
					return true;
				}
			}
		}
		console.log("current community: " + communityId);
		return true;
	}
	return false;
});

Template.registerHelper('currentUserIsSuperOrAdmin', function(){
	var user = Meteor.user();
	if (user && Roles.userIsInRole(user, ['superadmin'])){
		return true;
	} else {
		return false;
	}
});

Template.registerHelper('currentUserIsSuperAdmin', function(){
	var user = Meteor.user();
	if (user && Roles.userIsInRole(user, ['superadmin'])){
		return true;
	} else {
		return false;
	}
});

Template.registerHelper('currentUserIsAdmin', function(){
	var user = Meteor.user();
	if (user && Roles.userIsInRole(user, ['admin'])){
		return true;
	} else {
		return false;
	}
});

Template.registerHelper('currentUserIsCommunityAdmin', function(){
	var user = Meteor.user();
	if (user && Roles.userIsInRole(user, ['community-admin'])){
		var communityId = LocalStore.get('communityId');
		let profile = Meteor.user().profile;
		if(typeof profile.adminCommunities !== 'undefined'){
			let adminCommunities = profile.adminCommunities;
			if(Array.isArray(adminCommunities)){
				if(adminCommunities.includes(communityId)){
					return true;
				}
			}
		}
	} else {
		return false;
	}
});

Template.AdminDash.onRendered(function() {
	let url = window.location.hash;
	let hashString = url.substring(1,url.length);
	if(hashString.length){
		Session.set("adminTemplate",hashString);
	}else{
		Session.set("adminTemplate","Overview");
	}

});


Template.AdminDash.helpers({
  currentTemplate: function() {
		//console.log(Session.get("adminTemplate"));
  	return Session.get("adminTemplate");
  },
	//check if current user has admin rights
	/*
	currentUserHasAdmin: function(){
		console.log("currentUserHasAdmin called");
		var user = Meteor.user();
		//give super admin and admin full rights
		if (user && Roles.userIsInRole(user, ['admin', 'superadmin'])){
			console.log("admin/superadmin");
			return true;
		}
		//give community admin rights to the community only
		if (user && Roles.userIsInRole(user, ['community-admin'])){
			var communityId = LocalStore.get('communityId');
			let profile = Meteor.user().profile;
			if(typeof profile.adminCommunities !== 'undefined'){
				let adminCommunities = profile.adminCommunities;
				if(Array.isArray(adminCommunities)){
					if(adminCommunities.includes(communityId)){
						console.log("community-admin");
						return true;
					}
				}
			}
			console.log("current community: " + communityId);
			return true;
		}
		return false;
	}*/
});

Template.AdminDashHeader.events({
	'click .menu__link': function(event, template){
		Session.set("adminTemplate",event.target.dataset.template);
		//console.log(event.target.dataset.template);
	},
});
