import "./interests.html";
import { Tags } from '/imports/api/tags/Tags.js';
//import { setupTaggle } from '../../components/taggle/taggle.js'
import { Proposals } from '../../../api/proposals/Proposals.js'
import { getTags } from '../../components/taggle/taggle.js'
import { updateSessionTags } from '../../components/taggle/taggle.js'
import RavenClient from 'raven-js';

Template.Interests.onRendered(function(){
  var self = this;

  var communityId = LocalStore.get('communityId')
  self.autorun(function() {
    Meteor.subscribe('tags.community', communityId);
    Meteor.subscribe('users.delegates', communityId);
    Meteor.subscribe('proposals.community', communityId);
  });
  Session.set("tagIndex",-1);

  //self.taggle = new ReactiveVar(setupTaggle());
/*
  const handle = Meteor.subscribe('users.current');

  Meteor.call('getUserTags', Meteor.userId(), function(error, result){
    if (error){
      RavenClient.captureException(error);
      Bert.alert(error.reason, 'danger');
    } else {
      var keywords = _.map(result, function(tag){ return tag.keyword; });
      console.log(keywords);
      //self.taggle.get().add(keywords);
    }
  });
*/
});

Template.Interests.onCreated(function() {
  var self = this;
  self.type = new ReactiveVar("Waiting for response from server...");

  self.autorun(function() {
    self.subscribe('user.current');
    self.subscribe('users.usernames');
  });
  var dict = new ReactiveDict();
  dict.set('tagsCount', 0);

  this.templateDictionary = dict;
  //THIS IS VERY IMPORTANT, WEIRD SHIT HAPPENS IF YOU LEAVE THIS OUT
	$(document).ready(function() {
	  $(window).keydown(function(event){
	    if(event.keyCode == 13) {
	      event.preventDefault();
	      return false;
	    }
	  });
	});
});

Template.Interests.helpers({
  tags: ()=> {
    return Tags.find();
  },
  selectedTags: ()=> {

    let userProfile = Meteor.user().profile;
    if(typeof userProfile == 'undefined'){
      console.log("could not determine user profile");
      return [];
    }
    //console.log(Meteor.user());
    let tagsArray = userProfile.tags;
    if(typeof tagsArray == 'undefined'){
      //console.log("could not find profile tags");
      tagsArray = [];
      //selectedTags = Tags.find({_id: {$in: tagsArray}});
      //Session.set("selectedTags",selectedTags);
      //return selectedTags;
    }
    //console.log("tagsArray: ");
    //console.log(tagsArray);
    return tagsArray;
  },
  tagCount: (keyword)=>{
    delegateCount = Meteor.users.find({roles: 'delegate', 'profile.tags': { $elemMatch: {keyword: keyword}}}).count();
    proposalCount = Proposals.find({tags: { $elemMatch: {keyword: keyword}}}).count();
    totalCount = delegateCount+proposalCount;
    if(totalCount>0){
      return totalCount
    }
  }
});

Template.Interests.events({
	'click #update-tags' (event, template) {
  	event.preventDefault();
  	/*var communityId = LocalStore.get('communityId');
    Meteor.call('transformTags', getTags(), communityId, function(error, proposalTags){
			if (error){
        RavenClient.captureException(error);
        Bert.alert(error, 'reason');
			} else {*/
				var oldProfile = Meteor.users.find({_id: Meteor.userId()},{fields: {profile: 1, isPublic:1}}).fetch();
				var profile = {
          tags: getTags()
        }
		//		var newProfile = _.extend(oldProfile, profile);
    //  };

      Meteor.call('updateProfile', profile, function(error) {
        if (error) {
          RavenClient.captureException(error);
          Bert.alert(error.reason, 'danger');
        } else {
          Bert.alert(TAPi18n.__('pages.profile.alerts.profile-updated'), 'success');
        }
      });

  //  });
  },
  'click .display-tag' (event, template){
    tagId = event.target.dataset.id
    let selectedTags = Session.get("selectedTags");
    selectedTags.push(tagId);
    updateSessionTags(selectedTags);
  }
});
