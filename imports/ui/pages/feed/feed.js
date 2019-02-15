import "./feed.html"
import '../../components/profileHeader/profileHeader.js';
import RavenClient from 'raven-js';
Template.Feed.onCreated(function () {
  var self = this;
  self.user=null;
  let userId = FlowRouter.getParam("id");
  if(typeof userId =='undefined'){
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
  }
  self.userId = new ReactiveVar(userId);
  self.subscribe('users.profile');
  self.subscribe('posts', userId);
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
    Session.set("unsplashState","view");
    $("#unsplash-close").hide();
  });
});
/*
Template.Feed.onRendered(function(){
	self = this;

	this.autorun(function() {


  });
});
*/
Template.Feed.helpers({
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
    userId = Template.instance().userId.get();
  	return Posts.find({"userId":userId});
  }
});

Template.Feed.events({
  'click #create-post': function(event,template){
    event.preventDefault();
    let message = template.find('#post-message').value
    let post = {
      userId: Meteor.userId(),
      //url: '',
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
