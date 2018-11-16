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
    updateCommunity: function(communityId,settings) {
      var existing = Communities.findOne({_id: communityId});
      if (existing) {
        return Communities.update({_id: communityId}, {$set: {'settings': settings}});
      }else{
        throw new Meteor.Error(422, 'Could not find community');
      }
    },

    getCommunityBySubdomain: function(subdomain) {
    	return Communities.findOne({subdomain: subdomain});
    },

    updateEmailWhitelist: function(emails, communityId) {
      var community = Communities.findOne({_id: communityId});
      return Communities.update({_id: communityId}, {$set: {'settings.emailWhitelist': emails}});
    },

    updateEnforceWhitelist: function(enforce, communityId) {
      return Communities.update({_id: communityId}, {$set: {'settings.enforceWhitelist': enforce}});
    },

    updateWhitelistSettings: function(emailWhitelist, enforceWhitelist, communityId) {
      Meteor.call('updateEmailWhitelist', emailWhitelist, communityId);
      Meteor.call('updateEnforceWhitelist', enforceWhitelist, communityId);
    },

    setDefaultDates: function(){

    },
    disableDefaultDates: function(){

    },
    updateAbout: function(aboutText, communityId) {
      return Communities.update({_id: communityId}, {$set: {'settings.aboutText': aboutText}});
    },
    addFAQ: function(communityId,faqContent){
      console.log(communityId);
      check(communityId, String);
      check(faqContent, {
        lang: String,
        userId: String,
        question: String,
        answer: String,
        _id: String });
      var result = Communities.update({_id: communityId}, {$push: {faqs: faqContent}});
      console.log(result);
    },
    removeFAQ: function(communityId,faqId){
      console.log(communityId);
      console.log(faqId);
    },
});
