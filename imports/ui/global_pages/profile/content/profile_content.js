import { getTags } from '../../../components/taggle/taggle.js'
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
*/
Template.Profile_Account_Content.helpers({
  roles: function(){
    let user = Meteor.user();
    return user.roles;
  },
  profilePic: function(userId) {
  	return getUserProfilePhoto(userId);
  },
  selectedTags: ()=> {
    let tagsArray = [];
    if(Meteor.user()){
      let userProfile = Meteor.user().profile;
      if(typeof userProfile == 'undefined'){
        return [];
      }
      let tagsArray = userProfile.tags;
      if(typeof tagsArray == 'undefined'){
        tagsArray = [];
        //selectedTags = Tags.find({_id: {$in: tagsArray}});
        //Session.set("selectedTags",selectedTags);
        //return selectedTags;
      }
    }

    return tagsArray;
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
