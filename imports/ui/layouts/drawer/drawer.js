import './drawer.html';
import './notificationsDrawer.js';
import { Proposals } from '../../../api/proposals/Proposals.js'
import { DelegateVotes } from '../../../api/delegateVotes/DelegateVotes.js'

Template.Drawer.onCreated(function(){
  //console.log("all communities count: " + Communities.find().count());
  var self = this;
  var user = Meteor.user();
	if (user && user.roles){
		var currentRole = LocalStore.get('currentUserRole');
		var userRoles = user.roles;
		//if (!currentRole){
			//console.log(userRoles);
			if(userRoles.indexOf("individual") > -1){
				//console.log("user is individual");
				LocalStore.set('currentUserRole', 'individual');
				LocalStore.set('otherRole','individual');
			}
			if(userRoles.indexOf("organisation") > -1){
				//console.log("user is organisation");
				LocalStore.set('currentUserRole', 'organisation');
				LocalStore.set('otherRole','organisation');
			}
			if(userRoles.indexOf("party") > -1){
				//console.log("user is organisation");
				LocalStore.set('currentUserRole', 'party');
				LocalStore.set('otherRole','party');
			}
			if(userRoles.indexOf("delegate") > -1){
				//console.log("user has delegate role");
				LocalStore.set('isDelegate',true);
			}else{
				//console.log("user is not a delegate");
				LocalStore.set('isDelegate',false);
			}
			LocalStore.set('usingAsDelegate',false);
			//console.log("localstore currentUserRole: " + LocalStore.get('currentUserRole'));
			//console.log("localstore isDelegate: " + LocalStore.get('isDelegate'));
		//}
	}
})

Template.Drawer.events({
	'click #drawer-nav-logout' (event, template){
		event.preventDefault();
		LocalStore.set('currentUserRole','');
	  LocalStore.set('isDelegate','');
		$('.logged-in-header').removeClass('delegate_header');
		Meteor.logout();
	},
	'click .side-nav-link' (event, template){
		$('.side-nav').removeClass('is-visible');
		$('.mdl-layout__obfuscator').removeClass('is-visible');
	},
	'click .change-role'(event,template){
    let switchRole = event.target.dataset.role;
    console.log("switching role from: " + LocalStore.get('currentUserRole') + " to:" + switchRole);

    LocalStore.set('otherRole',LocalStore.get('currentUserRole'));
    LocalStore.set('currentUserRole', switchRole);
    if(switchRole=='delegate'){
      $('.logged-in-header').addClass('delegate_header');
      LocalStore.set('usingAsDelegate',true);
    }else{
      LocalStore.set('usingAsDelegate',false);
      $('.logged-in-header').removeClass('delegate_header');
    }

  },
});

Template.Drawer.helpers({
	currentUserRole() {
		return LocalStore.get('currentUserRole');
	},
	currentUserRoleText() {
		let currentUserRole = LocalStore.get('currentUserRole');
		//console.log("currentUserRoleText: " + currentUserRole);
		switch (currentUserRole) {
			case 'individual':
					text = TAPi18n.__('layout.header.nav_using_individual');
					break;
			case 'organisation':
					text = TAPi18n.__('layout.header.nav_using_organisation');
					break;
			case 'party':
					text = TAPi18n.__('layout.header.nav_using_party');
					break;
			case 'delegate':
					text = TAPi18n.__('layout.header.nav_using_delegate');
					break;
			default:
					text = '';
		}
		return text;
	},
	otherRoleText(){
		let otherRole = LocalStore.get('otherRole');
		switch (otherRole) {
			case 'delegate':
					text = TAPi18n.__('layout.header.nav_use_delegate');
					break;
			case 'individual':
					text = TAPi18n.__('layout.header.nav_use_individual');
					break;
			case 'organisation':
					text = TAPi18n.__('layout.header.nav_use_organisation');
					break;
			case 'party':
					text = TAPi18n.__('layout.header.nav_use_party');
					break;
			default:
					text = TAPi18n.__('layout.header.nav_use_individual');
		}
		return text;
	},
	otherRole(){
		return LocalStore.get('otherRole');
	},
	usingAsDelegate(){
		return LocalStore.get('usingAsDelegate');
	},
	isDelegate() {
		return LocalStore.get('isDelegate');
	}
})

//RIGHT DRAWER
Template.RightDrawer.events({
	'click #right-drawer-profile-link' (event, template){
		//event.preventDefault();
		//console.log("removing active")
		$(".right-drawer").removeClass('active');
	}
});

Template.RightDrawer.onCreated(function() {
	Session.set('drawerId','');
  var self = this;
  var communityId = LocalStore.get('communityId');
  self.autorun(function() {
    self.subscribe('user.profile',Session.get('drawerId'));
    self.subscribe('delegateVotes.forDelegate', Session.get('drawerId'));
		if(communityId){
			self.subscribe('proposals.public', '', communityId);
		}
  });
});

Template.RightDrawer.helpers({
	user: function(template) {
		userId = Session.get('drawerId');
		if (userId) {
			user = Meteor.users.findOne({_id: userId});
			return user;
		} else {
			return false;
		}
	},
	delegateVotes: function() {
		return DelegateVotes.find({delegateId: Session.get('drawerId')}, {sort: {date_created: -1}, limit: 10})
	},
	proposalTitle: function(proposalId) {
		var content = Proposals.findOne({_id: proposalId}).content;
		var translation = _.find(content, function(item){ return item.language == TAPi18n.getLanguage();})
		if (translation) {
			return translation.title;
		} else {
			return TAPi18n.__('pages.proposals.list.untranslated')
		}

	},
	voteIcon: function(vote){
    if (vote=='yes'){
      return 'check_circle'
    } else if (vote=='no'){
      return 'cancel'
    }
  }
})
