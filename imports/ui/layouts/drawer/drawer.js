import './drawer.html';

Template.Drawer.events({
	'click #drawer-nav-logout' (event, template){
		event.preventDefault();
		Meteor.logout();
	},
});

Template.RightDrawer.helpers({
	user: function(template) {
		userId = Session.get('drawerId');
		user = Meteor.users.findOne({_id: userId});
		//console.log(user)
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