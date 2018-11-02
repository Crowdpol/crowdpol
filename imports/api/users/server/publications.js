import { Meteor } from 'meteor/meteor';
import { Users } from '../Users.js';
import { Ranks } from '../../ranking/Ranks.js';
// on the server

// The info we usually want to publish for users
defaultUserProjection = {fields: {profile: 1,roles: 1,isPublic: 1}};

Meteor.publish('users.all', function() {
  /* to count how many users we have per community */
  return Meteor.users.find({}, {fields: {"profile.communityIds": 1}});
});

Meteor.publish('users.community', function(communityId) {
  return Meteor.users.find({"profile.communityIds" : communityId}, {fields: {profile: 1,roles: 1,isPublic: 1, emails: 1}});
});

Meteor.publish('user.profile', function(userId) {
  check(userId,String);
  return Meteor.users.find({_id: userId}, defaultUserProjection);
});

Meteor.publish('users.usernames', function() {
  return Meteor.users.find({}, {fields: {'profile.username': 1}});
});

// Publish approvals to list
Meteor.publish('users.pendingApprovals', function(communityId) {
	return Meteor.users.find(
    {
      "profile.communityIds" : communityId,
      "approvals" : {$exists: true},
      $where : "this.approvals.length > 0"
    },
    {fields: {_id: 1, profile: 1,roles: 1,isPublic: 1, approvals: 1}}
  );
})

Meteor.publish('users.current', function () {
  return Meteor.users.find({_id: Meteor.userId()}, {fields: {profile: 1,roles: 1,isPublic: 1, approvals:1}});
});

//null publish updates default currentUser Spacebar
Meteor.publish(null, function() {
  return Meteor.users.find({_id: Meteor.userId()}, defaultUserProjection);
});

/*Meteor.publish('users.candidates', function () {
  return Meteor.users.find({roles: "candidate"}, defaultUserProjection);
});*/

Meteor.publish('users.delegates', function (communityId) {
  return Meteor.users.find({roles: "delegate", 'profile.communityIds': communityId}, defaultUserProjection);
});

/*Meteor.publish('users.candidatesWithTag', function (keyword) {
  var tag = Meteor.call('getTagByKeyword', keyword)
  if (tag){
    return Meteor.users.find(
    {
      roles: 'candidate',
      'profile.tags': { $elemMatch: {_id: tag._id}}
    },
    defaultUserProjection);
  }
});*/

Meteor.publish('users.delegatesWithTag', function (keyword, communityId) {
  var tag = Meteor.call('getTagByKeyword', keyword, communityId)
  if (tag){
    return Meteor.users.find(
    {
      roles: 'delegate',
      'profile.tags': { $elemMatch: {_id: tag._id}},
      'profile.communityIds': communityId
    },
    defaultUserProjection);
  }
});

Meteor.publish('simpleSearch', function(search, type, communityId) {
  check( search, Match.OneOf( String, null, undefined ) );
  /*if (!search) {
    return Meteor.users.find({roles: type});
  }*/
  let query      = {'profile.communityIds': communityId, roles: type},
      projection = {fields: {profile: 1,roles: 1,isPublic: 1}};

  if ( search ) {
    let regex = new RegExp( search, 'i' );
    query = {$and: [
      {$or: [
        { "profile.firstName": regex },
        { "profile.lastName": regex },
        { "profile.userName": regex }
      ]},
      {'profile.communityIds': communityId},
      {roles: type}
    ]};

    projection.limit = 100;
  }
  var self = this;
   Meteor.users
        .find( query, projection )
        //loop through each match and add the ranking to the user object
        .forEach(function(user) {
            currentRanking = Ranks.findOne({entityType: type, entityId: user._id, supporterId: Meteor.userId()});
            ranking = 0;
            if(currentRanking){
              ranking = currentRanking.ranking;
            }
            user["ranking"] = ranking;
            self.added("users", user._id, user);
        });
    self.ready();
  //return Meteor.users.find( query, projection );
});

Meteor.publish('userSearch', function(search, communityId) {

  check( search, Match.OneOf( String, null, undefined ) );
  /*if (!search) {
    return Meteor.users.find({roles: type});
  }*/
  let query      = {'profile.communityIds': communityId},
      projection = {fields: {profile: 1,roles: 1,isPublic: 1}};

  if ( search ) {
    let regex = new RegExp( search, 'i' );
    query = {$and: [
      {$or: [
        { "profile.firstName": regex },
        { "profile.lastName": regex },
        { "profile.userName": regex },
        { "emails.address": regex}
      ]},
      {'profile.communityIds': communityId},
      {"isPublic" : true}
    ]};
    projection.limit = 100;
  }

  return Meteor.users.find( query, projection );
});
