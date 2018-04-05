import './users/users.js';
import './tags/tags.js';
import './approvals/approvals.js';
import './proposals/proposals.js';
import './voting/voting.js';
import './stats/stats.js';
import './dash.html';
import './communities/communities.js'

Template.registerHelper('currentUserIsAdmin', function(){
	var user = Meteor.user();
	if (user && Roles.userIsInRole(user, ['admin', 'superadmin'])){
		return true;
	} else {
		return false;
	}
})

Template.registerHelper('currentUserIsSuperAdmin', function(){
	var user = Meteor.user();
	if (user && Roles.userIsInRole(user, ['superadmin'])){
		return true;
	} else {
		return false;
	}
})