import './about.html';

import { Communities } from '../../../api/communities/Communities.js'

Template.About.onCreated(function() {
  var self = this;
  self.community = new ReactiveVar();

  // Get subdomain from LocalStore and subscribe to community
  var subdomain = LocalStore.get('subdomain');

  self.autorun(function(){
    self.subscribe('communities.subdomain', subdomain, function(){
    	self.community.set(Communities.findOne({subdomain: subdomain}))
    });
  });
});

Template.About.helpers({
	aboutProject: function() {
		return Template.instance().community.get().settings.aboutText;
	}
});