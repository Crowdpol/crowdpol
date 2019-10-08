import { Meteor } from 'meteor/meteor';
import { Maps } from '../Maps.js';

Meteor.publish('maps.all', function() {
	return Maps.find();
});

Meteor.publish('maps.community', function(communityId) {
	return Maps.find({communityId: communityId});
});

Meteor.publish('maps.children', function(communityId) {
	console.log("rootCommunityId: " + communityId);
	return Maps.find({"properties.rootCommunityId": communityId});
});

Meteor.publish('maps.key.children', function(key) {
	console.log("maps.key.children: " + key);
	return Maps.find({"properties.rootMap": key});
});
