import { getUserProfilePhoto, getUserfullname, getUsername, getUserTags, getUserInterests } from '../../../../utils/users';
import { Proposals } from '../../../../api/proposals/Proposals.js';
import { Posts } from '../../../../api/posts/Posts.js';
import { Likes } from '../../../../api/likes/Likes.js';
import "./presence_content.html";

Template.Presence_Content.onCreated(function(){
  var self = this;
	self.autorun(function() {
		//let proposalId = FlowRouter.getParam("id");
		self.subscribe('proposals.all');
	});

});

Template.Presence_Content.onRendered(function(){});

Template.Presence_Content.events({
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

Template.Presence_Content.helpers({
  presenceVision: function() {
  	return null;// "This is my vision...";
  },
  userFeed: function(){
    let ownerId = getOwnerId();
    let posts = Posts.find({"feedId":ownerId}, {sort: {createdAt: -1}});
  	return posts;
  },
  profilePic: function(userId) {
  	return getUserProfilePhoto(userId);
  },
  proposalOverview: function(){
    return Proposals.find({"authorId":Meteor.userId()},{limit:3});
  },
  proposalOverviewCount: function(){
    let count = Proposals.find({"authorId":Meteor.userId()}).count();
    if(count > 0){
      return false;
    }
    return true;
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
