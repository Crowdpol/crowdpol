import './drawer.html';

Template.Drawer.events({
	'click #drawer-nav-logout' (event, template){
		event.preventDefault();
		Meteor.logout();
	},
	'click .side-nav-link' (event, template){
		$('.side-nav').removeClass('is-visible'); 
		$('.mdl-layout__obfuscator').removeClass('is-visible'); 
	}
});

Template.RightDrawer.helpers({
	user: function(template) {
		userId = Session.get('drawerId');
		user = Meteor.users.findOne({_id: userId});
		console.log(user.profile.tags)
		return user;
	}
})

Template.RightDrawer.onCreated(function() {
	Session.set('drawerId','');
  var self = this;
  self.autorun(function() {
    self.subscribe('user.profile',Session.get('drawerId'));
  });
});
