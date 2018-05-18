import { check } from 'meteor/check';
import { Random } from 'meteor/random';
import { Communities } from './Communities.js'

Meteor.methods({
    createCommunity: function (community) {
      	// Check if subdomain is unique
      	var existing = Communities.findOne({subdomain: community.subdomain});
      	if (existing) {
  			throw new Meteor.Error(422, 'A community with that subdomain already exists!');
      	}
	    return Communities.insert(community);
    },

    getCommunityBySubdomain: function(subdomain) {
    	return Communities.findOne({subdomain: subdomain});
    },

    updateEmailWhitelist: function(emails, communityId) {
      var community = Communities.findOne({_id: communityId});
      var whitelist = community.settings.emailWhitelist;
      if (whitelist) {
        whitelist = _.union(whitelist, emails);
      } else {
        whitelist = emails;
      }
      return Communities.update({_id: communityId}, {$set: {'settings.emailWhitelist': whitelist}});
    },

    updateEnforceWhitelist: function(enforce, communityId) {
      return Communities.update({_id: communityId}, {$set: {'settings.enforceWhitelist': enforce}});
    },

    updateWhitelistSettings: function(emailWhitelist, enforceWhitelist, communityId) {
      Meteor.call('updateEmailWhitelist', emailWhitelist, communityId);
      Meteor.call('updateEnforceWhitelist', enforceWhitelist, communityId);
    }
});




