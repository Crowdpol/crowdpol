import "./userHome.html"
import '../../components/profileHeader/profileHeader.js';
import { Posts } from '../../../api/posts/Posts.js'
import { Likes } from '../../../api/likes/Likes.js'
import RavenClient from 'raven-js';
import snarkdown from 'snarkdown';

Template.UserHome.onCreated(function () {
  var self = this;
  self.user=null;
  let userId = FlowRouter.getParam("id");
  if(typeof userId =='undefined'){
    Session.set("coverState","view-edit");
    userId = Meteor.userId();
    user = Meteor.users.findOne({"_id":userId});
    if(typeof user != 'undefined'){
      let profile = user.profile;
      if(typeof profile.coverURL == 'undefined'){
        console.log("cover undefined, leave blank");
      }else{
        console.log("coverURL found");
      }
    }
  }else{
    Session.set("coverState","view");
  }
  self.userId = new ReactiveVar(userId);
  self.subscribe('users.profile');
  self.subscribe('feed-posts', userId);
  self.subscribe('likes.all');
  /*
  Meteor.call('getProfile',userId, function(error, result){
    if (error){
      RavenClient.captureException(error);
      Bert.alert(error.reason, 'danger');
      return false;
    } else {
      console.log("user set");
       self.user = new ReactiveVar(result);
    }
  });
  */
  self.autorun(function(){

    $("#unsplash-close").hide();
  });
});
/*
Template.UserHome.onRendered(function(){
	self = this;

	this.autorun(function() {


  });
});
*/
Template.UserHome.helpers({
  thisUser: function() {

  },
  profilePic: function() {
    let userId = Template.instance().userId.get();
    user = Meteor.users.findOne({"_id":userId});
    if(typeof user != 'undefined'){
      return user.profile.photo;
    }
  	return Meteor.user().profile.photo;
  },
  profileName: function(userId) {
    userId = Template.instance().userId.get();
    user = Meteor.users.findOne({"_id":userId});
    if(typeof user != 'undefined'){
      return (user.profile.firstName + " " + user.profile.lastName);
    }
  	return (Meteor.user().profile.firstName + " " + Meteor.user().profile.lastName);
  },
  profileUsername: function(userId) {
    userId = Template.instance().userId.get();
    user = Meteor.users.findOne({"_id":userId});
    if(typeof user != 'undefined'){
      return user.profile.username;
    }
  	return Meteor.user().profile.username;
  },
  userFeed: function(){
    userFeedId = Template.instance().userId.get();
    //console.log("userFeedId: " + userFeedId);
    //console.log(Posts.find({"userFeedId":userFeedId}).count());
  	return Posts.find({"userFeedId":userFeedId}, {sort: {createdAt: -1}});
  },
  currentUser: function(){
    userId = Template.instance().userId.get();
    if(userId==Meteor.userId()){
      return true;
    }
    return false;
  },
  alreadyFollowing: function(){
    userId = Template.instance().userId.get();
    //console.log("Already following: " + Meteor.users.find({_id: Meteor.userId(), "profile.following":userId}).count());
    return Meteor.users.find({_id: Meteor.userId(), "profile.following":userId}).count()
  },
  following: function(){
    let followers;
    userId = Template.instance().userId.get();
    user = Meteor.users.findOne({"_id":userId});
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
    let followers;
    userId = Template.instance().userId.get();
    //console.log(Meteor.users.find( { "profile.following" : userId }).count());
    return Meteor.users.find( { "profile.following" : userId });
  }
});

Template.UserHome.events({
  'click #follow-me': function(event,template){
    followId = Template.instance().userId.get();
    if(followId!=Meteor.userId()){
      Meteor.call('addFollower', Meteor.userId(),followId, function(error, postId){
    		if (error){
    			RavenClient.captureException(error);
    			Bert.alert(error.reason, 'danger');
    			return false;
    		} else {
    			 Bert.alert(TAPi18n.__('pages.feed.following'), 'success');
    		}
    	});
    }
  },
  'click #unfollow-me': function(event,template){
    followId = Template.instance().userId.get();
    if(followId!=Meteor.userId()){
      Meteor.call('removeFollower',Meteor.userId(),followId, function(error, postId){
    		if (error){
    			RavenClient.captureException(error);
    			Bert.alert(error.reason, 'danger');
    			return false;
    		} else {
    			 Bert.alert(TAPi18n.__('pages.feed.unfollow'), 'success');
    		}
    	});
    }
  },
  'click #create-post': function(event,template){
    event.preventDefault();
    let message = template.find('#post-message').value
    let userFeedId = Template.instance().userId.get();
    let post = {
      userId: Meteor.userId(),
      userFeedId: userFeedId,
      message: message,
    };
    Meteor.call('createPost', post, function(error, postId){
  		if (error){
  			RavenClient.captureException(error);
  			Bert.alert(error.reason, 'danger');
  			return false;
  		} else {
  			 Bert.alert(TAPi18n.__('pages.feed.post-created'), 'success');
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
    console.log("make comment");
  }
});

Template.ActivityFeed.helpers({
  profilePic: function(userId) {
  	return Meteor.user().profile.photo;
  },
  profileName: function(userId) {
  	return (Meteor.user().profile.firstName + " " + Meteor.user().profile.lastName);
  },
  profileUsername: function(userId) {
  	return Meteor.user().profile.username;
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
