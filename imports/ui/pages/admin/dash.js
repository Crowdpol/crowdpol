import './users/users.js';
import './tags/tags.js';
import './approvals/approvals.js';
import './proposals/proposals.js';
import './dash.html';

Template.registerHelper('currentUserIsAdmin', function(){
	var user = Meteor.user();
	if (user && Roles.userIsInRole(user, ['admin', 'superadmin'])){
		return true;
	} else {
		return false;
	}
})