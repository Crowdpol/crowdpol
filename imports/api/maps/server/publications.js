import { Meteor } from 'meteor/meteor';
import { Maps } from '../Maps.js';

Meteor.publish('maps.community', function(communityId) {
	return Maps.find({communityId: communityId});
});

Meteor.publish('maps.children', function(communityId) {
	return Maps.find({rootCommunityId: communityId});
});
