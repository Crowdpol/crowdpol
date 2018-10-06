import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Proposals } from '../proposals/Proposals.js'
import { Comments } from './Comments.js'

Meteor.methods({
  comment: function(commentAttributes) {
    check(commentAttributes, { message: String, proposalId: String, authorId: String, type: String });
    var user = Meteor.users.findOne({_id: commentAttributes.authorId});
    var proposal = Proposals.findOne(commentAttributes.proposalId);
    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to make comments");
    if (!commentAttributes.message)
      throw new Meteor.Error(422, 'Please write some content');
    if (!proposal)
      throw new Meteor.Error(422, 'You must comment on a proposal');
    let existingComment = Comments.find({"proposalId":commentAttributes.proposalId,"message":commentAttributes.message,"authorId":user._id}).count();
    if (existingComment)
      throw new Meteor.Error(422, 'Duplicate comment');
    comment = {
      message: commentAttributes.message,
      proposalId: commentAttributes.proposalId,
      authorId: Meteor.user()._id,
      type: commentAttributes.type
    }

    return Comments.insert(comment);
  },
  deleteComment: function(commentId) {
    check(commentId, String);
    Comments.remove(commentId);
  },
  getComment: function(commentId){
    check(commentId, String);
    return Comments.findOne({_id: commentId});
  },
  updateComment: function(commentId,message){
    check(commentId, String);
    check(message, String);
    console.log("conentId: " + commentId + " message: " + message);
    Comments.update({_id: commentId}, {$set: {"message": message}});
  }
});
