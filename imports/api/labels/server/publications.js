import { Meteor } from 'meteor/meteor';
import { Labels } from '../Labels.js';

Meteor.publish('labels.community', function(communityId) {
	return Labels.find({communityId: communityId});
});
