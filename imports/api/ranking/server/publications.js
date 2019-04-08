import { Meteor } from 'meteor/meteor';
import { Ranks } from '../Ranks.js';

Meteor.publish('ranks.all', function() {
  result =  Ranks.find({});
  return result;
});

Meteor.publish('ranks.currentUser', function(communityId) {
  result =  Ranks.find({"supporterId":Meteor.userId(),"communityId":communityId});
  return result;
});
