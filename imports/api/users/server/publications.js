import { Meteor } from 'meteor/meteor';
import { Users } from '../Users.js';
import { Ranks } from '../../ranking/Ranks.js';
// on the server

// The info we usually want to publish for users
defaultUserProjection = {fields: {profile: 1,roles: 1,isPublic: 1}};

Meteor.publish('users.all', function() {
  return Meteor.users.find({}, {fields: {profile: 1,roles: 1,isPublic: 1, emails: 1}});
});

Meteor.publish('user.profile', function(userId) {
  check(userId,String);
  return Meteor.users.find({_id: userId}, defaultUserProjection);
});

// Publish approvals to list 
Meteor.publish('users.pendingApprovals', function() {
	return Meteor.users.find(
    {
      "approvals" : {$exists: true}, 
      $where : "this.approvals.length > 0"
    }, 
    {fields: {_id: 1, profile: 1,roles: 1,isPublic: 1, approvals: 1}}
  );
})

Meteor.publish('users.current', function () {
  return Meteor.users.find({_id: Meteor.userId()}, {fields: {profile: 1,roles: 1,isPublic: 1, approvals:1}});
});

//null publish updates default currentUser Spacebar
Meteor.publish(null, function() {
  return Meteor.users.find({_id: Meteor.userId()}, defaultUserProjection);
});

Meteor.publish('users.candidates', function () {
  return Meteor.users.find({roles: "candidate"}, defaultUserProjection);
});

Meteor.publish('users.delegates', function () {
  return Meteor.users.find({roles: "delegate"}, defaultUserProjection);
});

Meteor.publish('users.candidatesWithTag', function (keyword) {
  var tag = Meteor.call('getTagByKeyword', keyword)
  if (tag){
    return Meteor.users.find(
    {
      roles: 'candidate', 
      'profile.tags': { $elemMatch: {_id: tag._id}}
    },
    defaultUserProjection);
  }
});

Meteor.publish('users.delegatesWithTag', function (keyword) {
  var tag = Meteor.call('getTagByKeyword', keyword)
  if (tag){
    return Meteor.users.find(
    {
      roles: 'delegate', 
      'profile.tags': { $elemMatch: {_id: tag._id}}
    },
    defaultUserProjection);
  }
});

Meteor.publish("user.search", function(searchValue) {
  if (!searchValue) {
    return Meteor.users.find({roles: "delegate"});
  }
  searchKey = "/.*" + searchValue + ".*/";
  
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
    //var result = Meteor.users.find({"profile.searchString": searchKey});
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
  return Meteor.users.find( {_id : {$in : result}}, defaultUserProjection );
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

Meteor.publish('simpleSearch', function(search,type) {
  check( search, Match.OneOf( String, null, undefined ) );
  /*if (!search) {
    return Meteor.users.find({roles: type});
  }*/
  let query      = {$and: [{roles: type},{ roles: { $nin: [ "demo" ] }}]},
      projection = {limit: 10, fields: {profile: 1,roles: 1,isPublic: 1}};

  if ( search ) {
    let regex = new RegExp( search, 'i' );

    query = {$and: [
      {$or: [
        { "profile.firstName": regex },
        { "profile.lastName": regex },
        { "profile.userName": regex }
      ]},
      {roles: type},
      { roles: { $nin: [ "demo" ] }}
    ]};

    projection.limit = 100;
  }
  var self = this;
   Meteor.users
        .find( query, projection )
        //loop through each match and add the ranking to the user object
        .forEach(function(user) {
            currentRanking = Ranks.findOne({entityType: type, entityId: user._id, supporterId: Meteor.userId()});
            ranking = 0;
            if(currentRanking){
              ranking = currentRanking.ranking;
            }
            user["ranking"] = ranking;
            self.added("users", user._id, user);
        });
    self.ready();
  //return Meteor.users.find( query, projection );
});
