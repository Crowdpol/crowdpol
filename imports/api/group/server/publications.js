import { Meteor } from 'meteor/meteor';
import { Group } from '../Group.js';

Meteor.publish('groups.community', function(communityId) {
	return Group.find({communityId: communityId});
});

Meteor.publish('groups.all', function() {
  return Group.find({});
});
