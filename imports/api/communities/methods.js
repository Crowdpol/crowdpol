import { check } from 'meteor/check';
import { Random } from 'meteor/random';
import { Communities } from './Communities.js'

Meteor.methods({
    createCommunity: function (community) {
      // Check if subdomain is unique
      var existing = Communities.findOne({name: community.name});
      if (existing) {
        if(typeof existing.name !=='undefined'){
          throw new Meteor.Error(422, 'A community with that name already exists!');
        }
      }
      existing = Communities.findOne({subdomain: community.subdomain});
      if (existing) {
        if(typeof existing.subdomain !=='undefined'){
          throw new Meteor.Error(422, 'A community with that subdomain already exists!');
        }
      }
	    return Communities.insert(community);
    },
    editCommunity: function (community) {
      check(community, {
        _id: String,
        name: String,
        subdomain: Match.Maybe(String),
        isRoot: Boolean,
        parentCommunity: Match.Maybe(String),
        isArchived: Match.Maybe(Boolean),
        settings: {
          contactEmail: Match.Maybe(String),
          colorScheme: Match.Maybe(String),
          logoUrl: Match.Maybe(String),
          faviconUrl: Match.Maybe(String),
          homepageImageUrl: Match.Maybe(String),
          homepageBannerText: Match.Maybe(String),
          homepageIntroText: Match.Maybe(String),
          aboutText: Match.Maybe(String),
          languageSelector: Boolean,
          defaultLanguage: Match.Maybe(String),
          languages: [String],
          emailWhitelist: Match.Maybe([String]),
          enforceWhitelist: Boolean,
          showDates: Boolean,
          defaultStartDate: Match.Maybe(Date),
          defaultEndDate: Match.Maybe(Date),
          delegateLimit: Match.Maybe(Number),
          collaboratorLimit: Match.Maybe(Number)
        }
      });

      //console.log(community);

      let notCommunityNameFound = Communities.find({_id:{$ne:community._id},name: community.name,"isArchived":{$ne:true}}).count();
      if(notCommunityNameFound > 0){
        throw new Meteor.Error(422, 'A community with that name already exists!');
      }

      let notCommunitySudomains = Communities.find({_id:{$ne:community._id},subdomain: community.subdomain,"isArchived":{$ne:true}}).count();
      if(notCommunitySudomains > 0){
        throw new Meteor.Error(422, 'A community with that sudomain already exists!');
      }

      var existingId = Communities.findOne({_id: community._id});
      if(existingId){
        return Communities.update({_id: community._id}, {$set:
          {
            '_id': community._id,
        		'name': community.name,
        		'subdomain': community.subdomain,
            'isRoot': community.isRoot,
            'parentCommunity': community.parentCommunity,
            'settings':community.settings
          }
        });
      }else{
        throw new Meteor.Error(422, 'Could not find community');
      }
    },
    updateCommunity: function(communityId,settings) {
      var existing = Communities.findOne({_id: communityId});
      if (existing) {
        return Communities.update({_id: communityId}, {$set: {'settings': settings}});
      }else{
        throw new Meteor.Error(422, 'Could not find community');
      }
    },
    deleteCommunity: function(communityId) {
      let isSuperAdmin = Roles.userIsInRole(Meteor.userId(), 'superadmin');
      if(isSuperAdmin){
        var existing = Communities.findOne({_id: communityId});
        if (existing) {
          /*
            TO DO:
            - delete proposals
            - delete comments
            - delete all other community associated things.
            - remove users
          */
          return Communities.update({_id: existing._id}, {$set:
            {
              'isArchived': true,
          	  'archiveDate': new Date()
            }
          });
        }else{
          throw new Meteor.Error(422, 'Could not find community');
        }
      }
      throw new Meteor.Error(422, 'You do not have permissions to delete communities');
    },
    getCommunityBySubdomain: function(subdomain) {
      check(subdomain, String);
    	let community = Communities.findOne({subdomain: subdomain});
      if(community){
        return community;
      }
      return null;
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
      //console.log(communityId);
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
      //console.log(communityId);
      //console.log(faqId);
    },
});
