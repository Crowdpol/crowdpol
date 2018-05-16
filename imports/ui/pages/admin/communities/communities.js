import './communities.html';
import { Communities } from '../../../../api/communities/Communities.js'
import RavenClient from 'raven-js';

Template.AdminCommunities.onCreated(function() {
  var self = this;
  Session.set('showCommunityForm', false);
  self.autorun(function() {
    self.subscribe('communities.all');
    self.subscribe('users.all');
  });
});

Template.AdminCommunities.helpers({
  communities: function() {
    return Communities.find({});
  },
  userCount: function(communityId) {
  	return Meteor.users.find({'profile.communityIds': communityId}).count();
  },
  showForm: function(){
  	return Session.get('showCommunityForm');
  },
  expandIcon: function(){
  	if (Session.get('showCommunityForm')) {
  		return 'expand_less'
  	} else {
  		return 'expand_more'
  	}
  }
});

Template.AdminCommunities.events({

	'click #new-community-link': function(event, template){
		var show = Session.get('showCommunityForm');
		Session.set('showCommunityForm', !show);
	}
});

Template.AddNewCommunity.events({
	'click .dropdown-item-defaultLanguage': function(event, template){
		template.find('#defaultLanguage').dataset.val = event.target.dataset.val;
		template.find('#defaultLanguage').value = event.target.dataset.val;
	},

	'click .dropdown-item-colorScheme': function(event, template){
		template.find('#colorScheme').dataset.val = event.target.dataset.val;
		template.find('#colorScheme').value = TAPi18n.__('admin.communities.colorScheme.' + event.target.dataset.val);
	},

	'submit form': function(event, template){
		event.preventDefault();

		var community = {
			name: template.find("#name").value,
			subdomain: template.find("#subdomain").value,
			settings: {
				colorScheme: template.find("#colorScheme").dataset.val,
				homepageImageUrl: template.find("#homepageImageUrl").value,
				homepageBannerText: template.find("#homepageBannerText").value,
				homepageIntroText: template.find("#homepageIntroText").value,
				aboutText: template.find("#aboutText").value,
				defaultLanguage: template.find("#defaultLanguage").dataset.val,
				languageSelector: template.find("#languageSelector").checked,
				emailWhitelist: template.find("#emailWhitelist").value.split(','),
				enforceWhitelist: template.find("#enforceWhitelist").checked,
			}
		}

		Meteor.call('createCommunity', community, function(error){
			if (error){
				Bert.alert(error.reason, 'danger');
			} else {
				alert("Community created. Don't forget to configure the subdomain on GoDaddy and Heroku!")
			}
		});
	},
});