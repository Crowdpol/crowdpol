import './drawer.html';
import './notificationsDrawer.js';
import { Proposals } from '../../../api/proposals/Proposals.js'
import { DelegateVotes } from '../../../api/delegateVotes/DelegateVotes.js'


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
	}
});

Template.RightDrawer.onCreated(function() {
	Session.set('drawerId','');
  var self = this;
  var communityId = LocalStore.get('communityId');
  self.autorun(function() {
    self.subscribe('user.profile',Session.get('drawerId'));
    self.subscribe('proposals.public', '', communityId);
    self.subscribe('delegateVotes.forDelegate', Session.get('drawerId'));
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
