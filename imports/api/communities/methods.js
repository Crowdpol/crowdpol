import { check } from 'meteor/check';
import { Random } from 'meteor/random';
import { Ranks } from '../ranking/Ranks.js'

Meteor.methods({
    createCommunity: function (newCommunity) {
      check(newCommunity, { 
          name: String, 
          subdomain: String
        });
        communityId = Community.insert(newCommunity);
  		return communityId;
    }
});




