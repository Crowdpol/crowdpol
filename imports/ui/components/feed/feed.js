import { Posts } from '../../../api/posts/Posts.js';
import { userProfilePhoto} from '../../../utils/users';
import './feed.html'

Template.Feed.onCreated(function(){
  console.log(this);
  this.autorun(() => {
    this.subscribe('feed-posts', LocalStore.get('communityId'));
  });
});

Template.Feed.onRendered(function(){

});

Template.Feed.events({
  'click #create-post': function(event,template){
    event.preventDefault();
    var communityId = LocalStore.get('communityId');
    let message = template.find('#post-message').value
    let post = {
      userId: Meteor.userId(),
      feedId: communityId,
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
  }
});

Template.Feed.helpers({
  feedCount: function(){
    var communityId = LocalStore.get('communityId');
    let posts = Posts.find({"feedId":communityId}, {sort: {createdAt: -1}});
    return posts.count();
  },
  feed: function(){
    var communityId = LocalStore.get('communityId');
    let posts = Posts.find({"feedId":communityId}, {sort: {createdAt: -1}});
  	return posts;
  },
  profilePic: function(userId) {
    return userProfilePhoto(userId);
  },
  currentUserId: function(){
    return Meteor.userId();
  },
});
