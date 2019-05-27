import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Likes } from './Likes.js'

Meteor.methods({
  createLike: function(like) {
    check(like, {
      userId: String,
      objectType: String,
      objectId: String,
    });
    let checkExisting = Likes.findOne({objectId: like.objectId,userId:like.userId});
    //console.log(checkExisting);
    if(checkExisting){
      return Likes.remove(like);
    }
    return Likes.insert(like);
  },
  deleteLike: function(like) {
    check(like, {
      userId: String,
      objectType: String,
      objectId: String,
    });
    return Likes.remove(like);
  },
});
