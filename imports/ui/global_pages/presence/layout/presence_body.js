import { smallworldGeoJSON } from '/lib/world.js'
//import {map,loadMap,addLayer} from '../../components/maps/leaflet.js'
//import '../../components/profileHeader/profileHeader.js';
import { getUserProfilePhoto, getUserHasCover, getUserCover, getUserfullname, getUsername, getUserTags, getUserInterests } from '../../../../utils/users';
import { Tags } from '../../../../api/tags/Tags.js'
import { Posts } from '../../../../api/posts/Posts.js'
import { Likes } from '../../../../api/likes/Likes.js'

import RavenClient from 'raven-js';
import snarkdown from 'snarkdown';
import "./presence_body.html";
const defaultURL = 'https://images.unsplash.com/photo-1454166155302-ef4863c27e70?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjUxNTY3fQ&w=1500&dpi=2';

Template.Presence_Body.onCreated(function(){
  Session.set("globalTemplate","Presence_Content");
  var self = this;
  let ownerId = getOwnerId();
  if(getUserHasCover(ownerId)){
    Session.set('coverURL',getUserCover(ownerId));
  }else{
    Session.set('coverURL',defaultURL);
  }

  self.autorun(function(){
    var communityId = LocalStore.get('communityId');
    self.subscribe('users.profile');
    self.subscribe('feed-posts', ownerId);
    self.subscribe('likes.all');
    self.subscribe('tags.community', communityId);
  });
});
Template.Presence_Body.onRendered(function(){});
Template.Presence_Body.events({
  'click #follow-me': function(event,template){
    followId = getOwnerId();
    if(followId!=Meteor.userId()){
      Meteor.call('addFollower', Meteor.userId(),followId, function(error, postId){
    		if (error){
    			RavenClient.captureException(error);
    			Bert.alert(error.reason, 'danger');
    			return false;
    		} else {
    			 Bert.alert(TAPi18n.__('feed.following'), 'success');
    		}
    	});
    }
  },
  'click #unfollow-me': function(event,template){
    followId = getOwnerId();
    if(followId!=Meteor.userId()){
      Meteor.call('removeFollower',Meteor.userId(),followId, function(error, postId){
    		if (error){
    			RavenClient.captureException(error);
    			Bert.alert(error.reason, 'danger');
    			return false;
    		} else {
    			 Bert.alert(TAPi18n.__('feed.unfollow'), 'success');
    		}
    	});
    }
  },
});
Template.Presence_Body.helpers({
  globalContent: function(){
    return Session.get("globalTemplate");
  },
  profileName: function(userId) {
  	return getUserfullname(getOwnerId());
  },
  profileUsername: function(userId) {
  	return "@" + getUsername(getOwnerId());
  },
  followingCount: function(){
    let followers;
    let user = Meteor.users.findOne({"_id":getOwnerId()});
    if(typeof user != 'undefined'){
      followers = user.profile.following;
    }else{
      followers = Meteor.user().profile.following;
    }
    if(Array.isArray(followers)){
      return Meteor.users.find( { _id : { $in :  followers} }).count();
    }
    return 0;
  },
  following: function(){
    let followers;
    let user = Meteor.users.findOne({"_id":getOwnerId()});
    if(typeof user != 'undefined'){
      followers = user.profile.following;
    }else{
      followers = Meteor.user().profile.following;
    }
    if(Array.isArray(followers)){
      //console.log(Meteor.users.find( { _id : { $in :  followers} }).count());
      return Meteor.users.find( { _id : { $in :  followers} });
    }
    return null;
  },
  followers: function(){
    return Meteor.users.find( { "profile.following" : getOwnerId() });
  },
  followersCount: function(){
    return Meteor.users.find( { "profile.following" : getOwnerId() }).count();
  },
  valuesCount: function(userId){
    let tagIdArray = getUserTags(getOwnerId());
    //console.log(tagIdArray);
    if(Array.isArray(tagIdArray)){
      return Tags.find({_id: {$in: tagIdArray}}).count();
    }
  },
  values: function(userId){
    let tagIdArray = getUserTags(getOwnerId());
    //console.log(tagIdArray);
    if(Array.isArray(tagIdArray)){
      let foundTags = Tags.find({_id: {$in: tagIdArray}});
      return foundTags;
    }
  },
  currentUserId: function(){
    return Meteor.userId();
  },
});

function getOwnerId(){
  let userId = FlowRouter.getParam("id");
  if(typeof userId =='undefined'){
    userId = Meteor.userId();

  }
  //console.log("ownerId: " + userId);
  return userId;
}
