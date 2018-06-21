import './dash.html';
import RavenClient from 'raven-js';
import { Proposals } from '../../../api/proposals/Proposals.js';
import { Ranks } from '../../../api/ranking/Ranks.js';

Template.Dash.onCreated(function () {
  // Set user's ranked delegates
  Meteor.call('getRanks', Meteor.userId(), "delegate", function(error, result){
    if(error) {
      RavenClient.captureException(error);
      Bert.alert(error.reason, 'danger');
    } else {
      Session.set('ranked', result);
    }
  });
  
  var self = this;
  self.ranks = new ReactiveVar([]);
  var communityId = LocalStore.get('communityId');
  self.autorun(function() {
    self.subscribe("simpleSearch",Session.get('searchPhrase'),"delegate", communityId);
    self.subscribe('ranks.all');
  });
  
});

Template.Dash.helpers({
	isUnapprovedEntity: ()=> {
		if ((Roles.userIsInRole(Meteor.userId(), ['organisation-delegate', 'party-delegate'])) && 
			(!Meteor.call('isApproved', Meteor.userId()))) {
			return true;
		} else {
			return false;
		}
	},

});

Template.Dash.events({
	'click .resend-verification-link' (event, template){
		Meteor.call('sendVerificationLink', (error, response) => {
			if (error){
				RavenClient.captureException(error);
				Bert.alert(error.reason, 'danger');
			} else {
				let email = Meteor.user().emails[0].address;
				message = TAPi18n.__('pages.dashboard.alerts.verification-email-sent',{email: email});
				Bert.alert(message, 'success');
			}
		});
	},

	'click #log-out' (event, template){
		event.preventDefault();
		Meteor.logout();
	},
	'click #log-in' (event, template){
		FlowRouter.go('/login');
	}
});

//DASH PROFILE
Template.DashProfile.helpers({
	profileStatus: ()=> {
		//Check if user is public
	    if( Meteor.user().isPublic) {
	      //True: - go private
	        return "Public"
	    }
	    return "Private";
	},
	tags: ()=> {
		users = Meteor.users.find({_id: Meteor.userId()},{fields: {profile: 1}}).fetch();
    return users[0].profile.tags;
	},
});

//DASH INTEREST
Template.DashInterests.onCreated(function () {

});

Template.DashInterests.helpers({
	tags: ()=> {
		users = Meteor.users.find({_id: Meteor.userId()},{fields: {profile: 1}}).fetch();
    return users[0].profile.tags;
	},
});

//DASH VOTE
Template.DashVote.helpers({
	openProposalCount: function() {
    return Proposals.find({endDate:{"$gte": new Date()}, stage: "live"}).count();
  },
  closedProposalCount: function() {
    return Proposals.find({endDate:{"$lte": new Date()}, stage: "live"}).count();
  },
  myProposalCount: function(){
    return Proposals.find({$or: [{authorId: Meteor.userId()}, {invited: Meteor.userId()} ]}).count();
  },
});

 //DASH DELEGATES
Template.DashDelegates.onCreated(function () {
	var self = this;
	self.autorun(function() {
    self.subscribe('ranks.all');
  });
});

Template.DashDelegates.helpers({
	ranks: ()=> {
		ranks = Session.get('ranked');
		if (typeof ranks !== 'undefined' && ranks.length > 0) {
			return Meteor.users.find( { _id : { $in :  Session.get('ranked')} },{sort: ["ranking"]} );
		}
		return null;
	}
});

Template.DashDelegates.events({
	'click .delegate-dash-item': function(event, template){
    Session.set('drawerId',this._id);
    if($('.mdl-layout__drawer-right').hasClass('active')){       
        $('.mdl-layout__drawer-right').removeClass('active'); 
     }
     else{
        $('.mdl-layout__drawer-right').addClass('active'); 
     }
    
  }
 });