import './approvals.html';
import RavenClient from 'raven-js';

Template.AdminApprovals.onCreated(function() {
  var self = this;
  var communityId = LocalStore.get('communityId');
  self.autorun(function() {
    self.subscribe('users.pendingApprovals', communityId);
  });
});

Template.AdminApprovals.helpers({
  pendingApprovals: ()=> {
    //var result = Meteor.users.find({"approvals" : {$exists: true}, $where : "this.approvals.length > 0"});
    var result = Meteor.users.find({"approvals": {$elemMatch: {status:'Requested'}}});
    //var result = Meteor.call('getRequests');
    console.log(result);
    return result;
  },
  checkStatus: (status)=> {
  	if(status=='Requested'){
  		return true
  	}
  }
});

Template.AdminApprovals.events({

	'click #approve-button': function(event, template){
		email = event.target.dataset.email;
		type = event.target.dataset.type;
		userID = event.target.dataset.userId;
		requestId = event.target.dataset.requestId;
		Meteor.call('approveUser', userID,requestId,'Approved','',function(error){
			if (error){
				RavenClient.captureException(error);
				Bert.alert(error.reason, 'danger');
			} else {
				Meteor.call('sendApproval', email, type);
				Bert.alert(TAPi18n.__('admin.alerts.user-approved'), 'success');//TAPi18n.__('profile-msg-private');
			}
		});  
		//
	},
	'click #reject-button': function(event, template){
		email = event.target.dataset.email;
		type = event.target.dataset.type;
		userID = event.target.dataset.userId;
		requestId = event.target.dataset.requestId;
		Meteor.call('approveUser', userID,requestId,'Rejected','',function(error){
			if (error){
				RavenClient.captureException(error);
				Bert.alert(error.reason, 'danger');
			} else {
				//Meteor.call('sendApproval', email, type);
				Bert.alert("User rejected", 'success');//TAPi18n.__('profile-msg-private');
			}
		});  
		//
	},
	/*'click #reject-button': function(event, template){

		email = event.target.dataset.email;
		type = event.target.dataset.type;
		userID = event.target.dataset.userId;
		requestId = event.target.dataset.requestId;
		Meteor.call('approveUser', userID,requestId,'Rejected','',function(error){
			if (error){
				Bert.alert(error.reason, 'danger');
			} else {
				Meteor.call('sendRejection', email, type);
				Bert.alert(TAPi18n.__('pages.admin.alerts.user-rejected'), 'success');//TAPi18n.__('profile-msg-private');
			}
		}); 
	}*/
});
