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
    //console.log(result);
    return result;
  },
  checkStatus: (status)=> {
  	if(status=='Requested'){
  		return true
  	}
  },
  showDate: function(createdAt){
  	return moment(createdAt).format('MMMM Do YYYY');
  },
  user: function(){
  	userId = Session.get('userId');
  	if (userId) {
		user = Meteor.users.findOne({_id: userId});
		//console.log(user);
		return user;
	} else {
		return false;
	}
  }
});

Template.AdminApprovals.events({
	'click #overlay' (event, template){
	    closeApprovalModal();
	 },
	'click #approve-button': function(event, template){
		event.preventDefault();
		//email = event.target.dataset.email;
		//type = event.target.dataset.type;
		userID = Session.get('userId');
		requestId = Session.get('requestId');
		Meteor.call('approveUser', userID,requestId,'Approved','',function(error){
			if (error){
				RavenClient.captureException(error);
				Bert.alert(error.reason, 'danger');
			} else {
				//Meteor.call('sendApproval', email, type);
				Bert.alert(TAPi18n.__('admin.alerts.user-approved'), 'success');//TAPi18n.__('profile-msg-private');
				closeApprovalModal();
			}
		});
		//
	},
	'click #reject-button': function(event, template){
		event.preventDefault();
		//email = event.target.dataset.email;
		//type = event.target.dataset.type;
		userID = Session.get('userId');
		requestId = Session.get('requestId');
		Meteor.call('approveUser', userID,requestId,'Rejected','',function(error){
			if (error){
				RavenClient.captureException(error);
				Bert.alert(error.reason, 'danger');
			} else {
				//Meteor.call('sendApproval', email, type);
				Bert.alert("User rejected", 'success');//TAPi18n.__('profile-msg-private');
				closeApprovalModal();
			}
		});
	},
	'click #preview-button': function(event, template){
		openApprovalModal();
		Session.set('userId',event.target.dataset.userId);
		Session.set('requestId',event.target.dataset.requestId);
		Session.set('requestId',event.target.dataset.requestId);
	}
});
openApprovalModal = function(event) {
  if (event) event.preventDefault();
  $(".approval-modal").addClass('active');
  $("#overlay").addClass('dark-overlay');
}

closeApprovalModal = function(event) {
  if (event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  $(".approval-modal").removeClass('active');
  $("#overlay").removeClass('dark-overlay');
}
