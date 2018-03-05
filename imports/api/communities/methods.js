import { check } from 'meteor/check';
import { Random } from 'meteor/random';
import { Communities } from './Communities.js'

Meteor.methods({
    createCommunity: function (newCommunity) {
      check(newCommunity, { 
          name: String, 
          subdomain: String
        });
        communityId = Communities.insert(newCommunity);
  		return communityId;
    }
});




