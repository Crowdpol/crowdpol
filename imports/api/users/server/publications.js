import { Meteor } from 'meteor/meteor';
import { Users } from '../Users.js';
// on the server
Meteor.publish('users', function() {
	return  Meteor.users.find({}, {fields: {services: false}});
});

Meteor.publish('users.all', function () {
  return Meteor.users.find();
});

// Publish approvals to list 
Meteor.publish('users.pendingApprovals', function() {
	//return Meteor.users.find({'profile.approvals.approved':false});
	//return Meteor.users.find({fields: {profile: 1,roles: 1,isPublic: 1,isParty: 1, approvals: 1, emails: 1}}).fetch();
	return Meteor.users.find({"approvals" : {$exists: true}, $where : "this.approvals.length > 0"});
})

Meteor.publish('users.current', function () {
  return Meteor.users.findOne({_id: Meteor.userId()});
});