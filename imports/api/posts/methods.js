import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Posts } from './Posts.js'

Meteor.methods({
  createPost: function(post) {
    check(post, {
      userId: String,
      feedId: String,
      //url: Match.Maybe([String]),
      message: String,
    });
    return Posts.insert(post);
  },
  deletePost: function(postId){

  },
  updatePost: function(post){
    check(post, {
      userId: String,
      feedId: String,
      //url: Match.Maybe([String]),
      message: String,
    });
    Comments.update({_id: post.postId}, {$set: {"message": post.message}});
  },
});
