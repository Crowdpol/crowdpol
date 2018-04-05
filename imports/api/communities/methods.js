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
    }
});




