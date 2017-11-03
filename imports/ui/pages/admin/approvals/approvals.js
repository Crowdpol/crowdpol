import './approvals.html';

Template.AdminApprovals.onCreated(function() {
  var self = this;
  self.autorun(function() {
    self.subscribe('users.pendingApprovals');
  });
});

Template.AdminApprovals.helpers({
  pendingApprovals: ()=> {
    return Meteor.users.find({'profile.approvals.approved':false});
  }
});

Template.AdminApprovals.events({

	'click #approve-button': function(event, template){
		email = event.target.dataset.email;
		type = event.target.dataset.type;
		userID = event.target.dataset.userId;
		Meteor.call('sendApproval', email, type);
		Meteor.call('approveUser', userID);
	},

	'click #reject-button': function(event, template){
		email = event.target.dataset.email;
		type = event.target.dataset.type;
		userID = event.target.dataset.userId;
		Meteor.call('clearApprovals', userID);
		Meteor.call('sendRejection', email, type);

	}
});