import { Meteor } from 'meteor/meteor';
import { Flags } from '../Flags.js';

Meteor.publish('flags.community', function(communityId) {
	return Flags.find({communityId: communityId});
});

