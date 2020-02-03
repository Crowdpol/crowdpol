/* SUSPECT FILES COLLECTION IS HURTING APP

import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

getUserSearch = function (search,communityId,invited) {
  check( search, Match.OneOf( String, null, undefined ) );
  //if (!search) {
  //  return Meteor.users.find({roles: type});
  //}
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
      {"isPublic" : true},
      { _id : { $nin :  Session.get('invited')} }
    ]};
    //console.log(regex);
    //console.log(query);
    projection.limit = 100;
  }

  return Meteor.users.find( query, projection );
};

getInvitedUsers = function (invited) {
  return Meteor.users.find({ _id : { $in :  invited} });
};
*/
