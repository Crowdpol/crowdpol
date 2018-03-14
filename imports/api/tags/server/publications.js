import { Meteor } from 'meteor/meteor';
import { Tags } from '../Tags.js';

Meteor.publish('tags.community', function(communityId) {
  return Tags.find({communityId: communityId});
});
