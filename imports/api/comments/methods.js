import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Proposals } from '../proposals/Proposals.js'
import { Comments } from './Comments.js'

Meteor.methods({
  comment: function(commentAttributes) {
    check(commentAttributes, {
      message: String,
      proposalId: String,
      authorId: String,
      type: String,
      upVote: Match.Maybe([String]),
      downVote: Match.Maybe([String]),
      language: Match.Maybe(String)
    });
    var user = Meteor.users.findOne({_id: commentAttributes.authorId});
    var proposal = Proposals.findOne(commentAttributes.proposalId);
    console.log(commentAttributes);
    
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
      type: commentAttributes.type,
      language: commentAttributes.language,
      downVote: commentAttributes.downVote,
      upVote: commentAttributes.upVote
    }

    let commentId = Comments.insert(comment);
    let eventLog = {
      commentId: commentId,
      type: commentAttributes.type,
      triggerUserId: Meteor.userId()
    }
    //console.log("commentId: " + commentId);
    Meteor.call('createProposalLog', comment.proposalId, eventLog);
    return commentId;
  },
  addArguments: function(argumentsArray,proposalId) {
    check(proposalId, String);
    if(argumentsArray.length>0){
      argumentsArray.forEach(function (argument, index) {
        argument.proposalId=proposalId;
        Comments.insert(argument);
      });
    }
  },
  deleteComment: function(commentId) {
    check(commentId, String);
    Comments.remove(commentId);
  },
  closeComment: function(commentId,message){
    check(commentId, String);
    Comments.update({_id: commentId}, {$set: {"closed": true}});
  },
  getComment: function(commentId){
    check(commentId, String);
    return Comments.findOne({_id: commentId});
  },
  updateComment: function(commentId,message){
    check(commentId, String);
    check(message, String);
    Comments.update({_id: commentId}, {$set: {"message": message}});
  },
  upvoteComment: function(commentId){
    check(commentId, String);
    let comment = Comments.findOne(commentId);
    let downVotes = comment.downVote;
    let upVotes = comment.upVote;
    let upVoteCount = comment.upVoteCount;
    let downVoteCount = comment.downVoteCount;
    if(downVotes.indexOf(Meteor.user()._id)>-1){
      downVoteCount = parseInt(downVoteCount - 1);
      Comments.update({_id: commentId}, {$pull: {downVote: Meteor.user()._id} });
      Comments.update({_id: commentId}, {$set: {"downVoteCount": downVoteCount}});
    }
    if(upVotes.indexOf(Meteor.user()._id)==-1){
      upVoteCount = parseInt(upVoteCount  + 1);
      Comments.update({_id: commentId},{$push: {upVote: Meteor.user()._id} });
      return Comments.update({_id: commentId}, {$set: {"upVoteCount": upVoteCount}});
    }else{
      throw new Meteor.Error(422, 'You have already liked this');
    }
  },
  downvoteComment: function(commentId){
    check(commentId, String);
    let comment = Comments.findOne(commentId);
    let downVotes = comment.downVote;
    let upVotes = comment.upVote;
    let upVoteCount = comment.upVoteCount;
    let downVoteCount = comment.downVoteCount;
    if(upVotes.indexOf(Meteor.user()._id)>-1){
      upVoteCount = parseInt(upVoteCount -1);
      Comments.update({_id: commentId},{$pull: {upVote: Meteor.user()._id} });
      Comments.update({_id: commentId}, {$set: {"upVoteCount": upVoteCount}});
    }
    if(downVotes.indexOf(Meteor.user()._id)==-1){
      downVoteCount = parseInt(downVoteCount + 1);
      Comments.update({_id: commentId}, {$push: {downVote: Meteor.user()._id} });
      return Comments.update({_id: commentId}, {$set: {"downVoteCount": downVoteCount}});
    }else{
      throw new Meteor.Error(422, 'You have already disliked this');
    }
  },
});
