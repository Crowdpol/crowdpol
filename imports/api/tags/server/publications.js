import { Meteor } from 'meteor/meteor';
import { Tags } from '../Tags.js';

Meteor.publish('tags.community', function() {
	var communityId = Meteor.user().profile.communityId;
  	return Tags.find({communityId: communityId});
});
