import "./userFeed.html"
import { smallworldGeoJSON } from '/lib/world.js'
//import {map,loadMap,addLayer} from '../../components/maps/leaflet.js'
import '../../components/profileHeader/profileHeader.js';
import { getUserProfilePhoto, getUserfullname, getUsername, getUserTags, getUserInterests } from '../../../utils/users';
import { Tags } from '../../../api/tags/Tags.js'
import { Posts } from '../../../api/posts/Posts.js'
import { Likes } from '../../../api/likes/Likes.js'
import RavenClient from 'raven-js';
import snarkdown from 'snarkdown';

Template.UserFeed.onCreated(function () {
  var communityId = LocalStore.get('communityId');
  Session.set("coverURL","");
  Session.set("hasCover","");
  Session.set("coverState","");
  var self = this;
  let ownerId = getOwnerId();
  self.autorun(function(){
    self.subscribe('users.profile');
    self.subscribe('feed-posts', ownerId);
    self.subscribe('likes.all');
    self.subscribe('tags.community', communityId);
    $("#unsplash-close").hide();
  });
});

Template.UserFeed.onRendered(function(){
  /*
  let geojson = smallworldGeoJSON;
  mapLayer = new L.geoJSON(geojson,{
    style: mapStyle
  });
  //let map = L.map('feed-map').fitWorld();
  var map = L.map('feed-map', {
      //minZoom: 0,
      //maxZoom: 0
      doubleClickZoom: false,
      zoomControl: false,
  });//.fitWorld();
  //L.tileLayer.provider('Esri.WorldGrayCanvas').addTo(map);

  mapLayer.addTo(map);
  map.dragging.disable();
  //map.setView([0, 0], 0);
  map.touchZoom.disable();
  map.doubleClickZoom.disable();
  map.scrollWheelZoom.disable();
  map.fitBounds(mapLayer.getBounds());
  /*
  $.getScript('json/world.json', function(json){
    // script should be loaded and do something with it.
    console.log(json);
  });
  */

});

Template.UserFeed.helpers({
  thisUser: function() {
    return getOwnerId();
  },
  profilePic: function(userId) {
    return getUserProfilePhoto(userId);
    //console.log(getUserProfilePhoto(userId));
  	//return Meteor.user().profile.photo;
  },
  profileName: function(userId) {
  	return getUserfullname(getOwnerId());
  },
  profileUsername: function(userId) {
  	return "@" + getUsername(getOwnerId());
  },
  userFeed: function(){
    let ownerId = getOwnerId();
    let posts = Posts.find({"feedId":ownerId}, {sort: {createdAt: -1}});
  	return posts;
  },
  currentUserId: function(){
    return Meteor.userId();
  },
  currentUser: function(){
    if(getOwnerId()==Meteor.userId()){
      return true;
    }
    return false;
  },
  alreadyFollowing: function(){
    return Meteor.users.find({_id: Meteor.userId(), "profile.following":getOwnerId()}).count()
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
  'isAuthorised'(tag){
    if(tag.authorized){
      return 'tag-authorised';
    }else{
      return 'tag-not-authorised';
    }
  },
  interests: function(){
    console.log(getUserInterests(getOwnerId()));
    return getUserInterests(getOwnerId());
  }
});

Template.UserFeed.events({
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
  'click #create-post': function(event,template){
    event.preventDefault();
    let message = template.find('#post-message').value
    let post = {
      userId: Meteor.userId(),
      feedId: getOwnerId(),
      message: message,
    };
    Meteor.call('createPost', post, function(error, postId){
  		if (error){
  			RavenClient.captureException(error);
  			Bert.alert(error.reason, 'danger');
  			return false;
  		} else {
  			 Bert.alert(TAPi18n.__('feed.post-created'), 'success');
         template.find('#post-message').value = "";
         $("#post-message").addClass('post-textarea-small');
         $("#post-message").removeClass('post-textarea-large');
  		}
  	});
  },
  'focus #post-message': function(event,template){
    $("#post-message").removeClass('post-textarea-small');
    $("#post-message").addClass('post-textarea-large');
  },
  'blur #post-message': function(event,template){
    let content = $("#post-message").val();
    //if no content, collapse
    if(content.length==0){
      $("#post-message").addClass('post-textarea-small');
      $("#post-message").removeClass('post-textarea-large');
    }else{
      $("#post-message").removeClass('post-textarea-small');
      $("#post-message").addClass('post-textarea-large');
    }
  },
  'click .like-post': function(event,template){
    let postId = event.target.dataset.id;
    if(typeof postId != 'undefined'){
      let like = {
        userId: Meteor.userId(),
        objectType: 'post',
        objectId: postId
      }
      Meteor.call('createLike', like, function(error,likeId){
    		if (error){
    			RavenClient.captureException(error);
    			Bert.alert(error.reason, 'danger');
    			return false;
    		} else {
    			 //Bert.alert(TAPi18n.__('pages.feed.like-created'), 'success');
    		}
    	});
    }
  },
  'click .comment-post': function(event,tempate){
    //console.log("make comment");
  }
});

Template.ActivityFeed.helpers({
  profilePic: function(userId) {
  	return getUserProfilePhoto(userId);
  },
  profileName: function(userId) {
  	return getUserfullname(userId);
  },
  profileUsername: function(userId) {
  	return getUsername(userId);
  },
  profileDate: function(postDate) {
    return moment(postDate).fromNow();
  },
  formatMessage: function(message){
    if(typeof message !='undefined'){
      var matches = message.match(/\bhttps?:\/\/\S+/gi);
      if(matches == null){
        //console.log("no matches");
      }else{
        matches.forEach(function(item) {
          //console.log("<a href='"+item+"'>"+item+"</a>");
          message = message.replace(item, "<a href='"+item+" target='_blank'>"+item+"</a>");
        });
      }
    }
    return message;
  },
  likeCount: function(objectId){
    let likes = Likes.find({objectId:objectId}).count();
    if(likes>0){
      return likes;
    }
    return '';
  },
  likeIcon: function(objectId){
    let existing = Likes.findOne({objectId:objectId, userId: Meteor.userId()});
    if(existing){
      return 'favorite';
    }else{
      return 'favorite_border';
    }

  }
});

function getOwnerId(){
  let userId = FlowRouter.getParam("id");
  if(typeof userId =='undefined'){
    userId = Meteor.userId();

  }
  //console.log("ownerId: " + userId);
  return userId;
}

function mapStyle(feature) {
  return {
    fillColor: "#fff",
    fillOpacity: 1,
    color: '#fff',
    stroke: true,
    weight: 1
  };
}
