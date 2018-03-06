import { check } from 'meteor/check';
import { Random } from 'meteor/random';
import { Communities } from './Communities.js'

Meteor.methods({
    createCommunity: function (newCommunity) {
      check(newCommunity, { 
          name: String, 
          subdomain: String
        });
      	// Check if subdomain is unique
      	var existing = Communities.findOne({subdomain: subdomain});
      	if (existing) {
  			throw new Meteor.Error(422, 'A community with that subdomain already exists!');
      	}
	    return Communities.insert(newCommunity);
    },

    getCommunityBySubdomain: function(subdomain) {
    	return Communities.findOne({subdomain: subdomain});
    }
});




