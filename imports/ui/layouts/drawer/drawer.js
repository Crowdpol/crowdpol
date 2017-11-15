import './drawer.html';

Template.Drawer.events({
	'click #drawer-nav-logout' (event, template){
		event.preventDefault();
		Meteor.logout();
	},
});