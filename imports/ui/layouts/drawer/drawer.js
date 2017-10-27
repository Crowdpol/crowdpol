import './drawer.html';

Template.Header.events({
	'click #drawer-nav-logout' (event, template){
		event.preventDefault();
		Meteor.logout();
	},
});