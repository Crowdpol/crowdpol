import { Meteor } from 'meteor/meteor';
import { Groups } from '../Groups.js';

Meteor.publish('groups.community', function(communityId) {
	return Groups.find({communityId: communityId});
});

Meteor.publish('groups.all', function() {
  return Groups.find({});
});

Meteor.publish('groups.handle', function(handle) {
  return Groups.find({handle:handle});
});
