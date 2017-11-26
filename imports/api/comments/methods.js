import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Proposals } from '../proposals/Proposals.js'
import { Comments } from './Comments.js'

Meteor.methods({
  comment: function(commentAttributes) {
    check(commentAttributes, { message: String, proposalId: String });
    var user = Meteor.user();
    var proposal = Proposals.findOne(commentAttributes.proposalId);
    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to make comments");
    if (!commentAttributes.message)
      throw new Meteor.Error(422, 'Please write some content');
    if (!proposal)
      throw new Meteor.Error(422, 'You must comment on a proposal');
    comment = {
      message: commentAttributes.message,
      proposalId: commentAttributes.proposalId,
      authorId: user._id
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
  }
});