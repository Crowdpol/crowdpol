import { Meteor } from 'meteor/meteor';
import { Users } from '../Users.js';
import { Ranks } from '../../ranking/Ranks.js';
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
  //searchValue = "/" + searchValue + "/";
  //console.log("searchValue " + searchValue);
  var result = false;
  try{
    result = Meteor.users.aggregate([
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
    ]);
  } catch(e) {
    console.log(e.name + " " + e.message);
  }
  return result;
});

Meteor.publish("user.ranks", function(userId,type) {
  results = Ranks.aggregate([
        { $match: {"supporterId" : "ayekMtRQgoj3PAchM","entityType" : "delegate"}},
        {$project:{"_id": 0,"entityId" :1}}
  ]).map(function(el) { return el.entityId });
  console.log(results);
  return Meteor.users.find( { _id : { $in : results } } );
  /*
  check(userId, String);
  check(type, String);
  console.log("ranks.type: userId: " + userId + " type: " + type);
  var ranks = [];
  Meteor.call('getRank',Meteor.userId(),'delegate',function(error,result){
      if (error) {
        console.log(error);
      } else {
        console.log("meteor call return: " + result.length);
        ranks = result;
        console.log(ranks);
        users =  Meteor.users.find( { _id : { $in : ranks } } );
        console.log(users);
        return users;
      }
  });
  */
});
