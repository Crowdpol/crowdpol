import { Meteor } from 'meteor/meteor';
import { Labels } from '../Labels.js';

Meteor.publish('labels.community', function(communityId) {
	return Labels.find({communityId: communityId});
});

Meteor.publish('labelSearch', function(search, communityId) {
  check( search, Match.OneOf( String, null, undefined ) );
  /*if (!search) {
    return Meteor.users.find({roles: type});
  }*/
	console.log(search);
  let query      = {'communityIds': communityId};

  if ( search ) {
    let regex = new RegExp( search, 'i' );
    query = {$and: [
      {$or: [
        { "description": regex },
        { "keyword": regex}
      ]},
      {'communityId': communityId}
    ]};
    projection.limit = 100;
  }

  return Labels.find( query );
});
