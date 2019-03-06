import './users/users.js';
import './tags/tags.js';
import './labels/labels.js';
import './approvals/approvals.js';
import './proposals/proposals.js';
import './voting/voting.js';
import './stats/stats.js';
import './dash.html';
import './communities/communities.js'
import './settings/settings.js'

Template.registerHelper('currentUserIsAdmin', function(){
	var user = Meteor.user();
	if (user && Roles.userIsInRole(user, ['admin', 'superadmin'])){
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
  	// only display expired proposals that are public
  	return Session.get("adminTemplate");
  }
});

Template.AdminDashHeader.events({
	'click .menu__link': function(event, template){
		Session.set("adminTemplate",event.target.dataset.template);
	},
});
