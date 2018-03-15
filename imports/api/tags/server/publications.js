import { Meteor } from 'meteor/meteor';
import { Tags } from '../Tags.js';

Meteor.publish('tags.community', function() {
	if (Meteor.user()) {
		var communityId = Meteor.user().profile.communityId;
  		return Tags.find({communityId: communityId});
	}
});

