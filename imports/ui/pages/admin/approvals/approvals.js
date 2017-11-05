import './approvals.html';

Template.AdminApprovals.onCreated(function() {
  var self = this;
  self.autorun(function() {
    self.subscribe('users.pendingApprovals');
    //self.subscribe('users.all');
  });
});

Template.AdminApprovals.helpers({
  pendingApprovals: ()=> {
    var result = Meteor.users.find({"approvals" : {$exists: true}, $where : "this.approvals.length > 0"});
    //var result = Meteor.call('getRequests');
    console.log(result);
    return result;
  }
});

Template.AdminApprovals.events({

	'click #approve-button': function(event, template){
		email = event.target.dataset.email;
		type = event.target.dataset.type;
		userID = event.target.dataset.userId;
		requestId = event.target.dataset.requestId;
		//Meteor.call('sendApproval', email, type);
		Meteor.call('approveUser', userID,requestId,'Approved','');

	},

	'click #reject-button': function(event, template){

		email = event.target.dataset.email;
		type = event.target.dataset.type;
		userID = event.target.dataset.userId;
		requestId = event.target.dataset.requestId;
		//Meteor.call('clearApprovals', userID);
		//Meteor.call('sendRejection', email, type);
		Meteor.call('approveUser', userID,requestId,'Rejected','');
	}
});