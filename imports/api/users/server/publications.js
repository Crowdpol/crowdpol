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
  return Meteor.users.findOne({_id: Meteor.userId()},{fields: {profile: 1,roles: 1,isPublic: 1,isParty: 1,isOrganisation: 1}});
});
//null publish updates default currentUser Spacebar
Meteor.publish(null, function() {
  return Meteor.users.find({_id: Meteor.userId()},{fields: {profile: 1,roles: 1,isPublic: 1,isParty: 1,isOrganisation: 1}});
});

Meteor.publish('users.delegates', function () {
  return Meteor.users.find({roles: "candidate"});
});

Meteor.publish("user.search", function(searchValue) {
  if (!searchValue) {
    return Meteor.users.find({roles: "delegate"});
  }
  searchValue = "/" + searchValue + "/";
  //console.log("searchValue " + searchValue);
  return Meteor.users.find(
    { $text: {$search: searchValue} },
    {
      // `fields` is where we can add MongoDB projections. Here we're causing
      // each document published to include a property named `score`, which
      // contains the document's search rank, a numerical value, with more
      // relevant documents having a higher score.
      fields: {
        score: { $meta: "textScore" }
      },
      // This indicates that we wish the publication to be sorted by the
      // `score` property specified in the projection fields above.
      sort: {
        score: { $meta: "textScore" }
      }
    }
  );
});