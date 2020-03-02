import { getUserProfilePhoto, getUserfullname, getUsername, getUserTags, getUserInterests } from '../../../../utils/users';
import { Posts } from '../../../../api/posts/Posts.js';
import { Likes } from '../../../../api/likes/Likes.js';
import "./profile_content.html";
/*
Template.Profile_Content.onCreated(function(){});
Template.Profile_Content.onRendered(function(){});
Template.Profile_Content.events({
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
Template.Profile_Content.helpers({
  userFeed: function(){
    let ownerId = getOwnerId();
    let posts = Posts.find({"feedId":ownerId}, {sort: {createdAt: -1}});
  	return posts;
  },
  profilePic: function(userId) {
  	return getUserProfilePhoto(userId);
  },
});
*/

function getOwnerId(){
  let userId = FlowRouter.getParam("id");
  if(typeof userId =='undefined'){
    userId = Meteor.userId();

  }
  //console.log("ownerId: " + userId);
  return userId;
}
