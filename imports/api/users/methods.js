import { check } from 'meteor/check';
import { Random } from 'meteor/random';
import { Ranks } from '../ranking/Ranks.js'

Meteor.methods({

    addUser: function (newUser) {
      //console.log("method addUser called");
      userId = Accounts.createUser(newUser);
      return userId;
    },
    isPublic: function (userId) {
      check(userID, String);
      user = Meteor.users.findOne({_id: Meteor.userId()},{fields: {profile: 1,roles: 1,isPublic: 1}});;
      //console.log("isPublic: " + user.isPublic);
      return user.isPublic;
    },
    getUser: function (userID) {
      //console.log("method getUser called");
      check(userID, String);
      const users = Meteor.users.find({_id: userID}).fetch();
        return users[0];
    },
    deleteUser: function (userID) {
      //console.log("method deleteUser called");
      check(userID, String);
      Meteor.users.remove({_id:userID});
    },
    getProfile: function (userID) {
      //console.log("method getUserProfile called: " + userID);
      check(userID, String);
      const users = Meteor.users.find({_id: userID},{fields: {profile: 1, isPublic:1}}).fetch();
      //console.log(users);
      return users[0];
    },
    getUserTags: function(userID) {
      check(userID, String);
      const users = Meteor.users.find({_id: userID},{fields: {profile: 1}}).fetch();
      return users[0].profile.tags;
    },
    updateProfile: function (userID, profile) {
      //console.log(profile);
      check(userID, String);
      searchString = profile.firstName + " " + profile.lastName + " " + profile.username;
      profile["searchString"] = searchString;
      Meteor.users.update({_id: userID}, {$set: {"profile": profile}});
    },
    togglePublic: function (userID,isPublic) {
      check(userID, String);
      check(isPublic, Boolean);
      Meteor.users.update({_id: userID}, {$set: {"isPublic": isPublic}});
      /*if a user has pending request for delegate/candidate approval
      and makes their profile private, remove the requests*/
      var user = Meteor.call('getUser', userID)
      var pendingApprovals = user.approvals.find(approval => approval.status == 'Requested');
      if (pendingApprovals){
        Meteor.users.update({_id: userID}, {$set: {"approvals": []}});
      }

    },
    addEntity: function(entity) {
      check(entity, { 
        email: String, 
        password: String, 
        phone: Match.Maybe(String), 
        contact: Match.Maybe(String), 
        profileType: Match.Maybe(String), 
        name: String, 
        website: Match.Maybe(String),
        roles: Match.Maybe(String) });

      entityID = Accounts.createUser({
        'email': entity.email,
        'password': entity.password,
        'isPublic' : false
        });

      // Update profile
      profile = {'firstName': entity.name,
      'website': entity.website,
      'phoneNumber': entity.phone,
      'contactPerson': entity.contact,
      'type': entity.profileType,
      //'username': generateUs"approvals": {$exists: true}, $where : "this.approvals.length > 0"})ername(entity.name),
      'searchString': entity.name //+ ' ' + generateUsername(entity.name)
      };

      Meteor.call('updateProfile', entityID, profile);

      // Add entity to role
      Roles.addUsersToRoles(entityID, entity.roles);

      return entityID;

    },
    isApproved: function(userID) {
      check(userID, String);
      user = Meteor.call('getUser', userID);

      if (user.approvals){
        for (i = 0; i < user.approvals.length; i++){
          if (user.approvals[i].status != 'Approved'){
            return false;
          }
        }
      } else {
        return false;
      }

      return true;

    },
    clearApprovals: function(userID){
      check(userID, String);
      Meteor.users.update({_id: userID}, {$set: {"approvals": []}});
    },
    approveUser: function(userID, requestId, status){
      check(userID, String);
      check(requestId, String);
      check(status, String);
      user = Meteor.users.findOne({_id: userID, "approvals": {$exists: true}, $where : "this.approvals.length > 0"});

      approvals = user.approvals;
      var type = null;
      for (i=0; i<approvals.length; i++){
        if(approvals[i].id==requestId){
          approvals[i].status = status;
          approvals[i].reviewedBy = Meteor.userId();
          approvals[i].reviewedOn = new Date();
          type = approvals[i].type;
        }
      }
      Meteor.users.update({_id: userID}, {$set: {'approvals': approvals}});
      if(type&&status=='Approved'){
        Roles.addUsersToRoles(userID, type);
      }
    },
    requestApproval: function (userId, type) {
      check(userId, String);
      check(type, String);
      //don't create request unless profile is complete
      if (profileIsComplete(Meteor.user())) {
        //check if this user already has an approval of this type
        //users should only ever have one approval per 
        var existingApprovalCount = Meteor.users.find({$and:[{_id: userId},{'approvals.type': type}]}).count();
        if (existingApprovalCount > 0){ 
          //an approval request of this type already exists - remove it.
          Meteor.users.update({_id: userId}, {$pull: {approvals: {type: type}} });
        } 
        //get current user approvalRequests
        var currentApprovals = Meteor.user().approvals;
        //add to existing array before update, or else it just replaces what is already there
        const existingRequests = currentApprovals || [];
        existingRequests.push({
          "id": Random.id(),
          "type" : type,
          "status" : "Requested",
          "createdAt" : new Date(),
        });
        Meteor.users.update({_id: Meteor.userId()}, {$set: {"approvals": existingRequests}});
      } else {
        Bert.alert('You can not apply to be a candidate or delegate if your profile is incomplete.', 'danger')
      }
      
    },
    toggleRole: function (userID,role,state) {
      check(userID, String);
      check(role, String);
      check(state, Boolean);
      if(state){
        console.log("adding role: " + role);
        if ((role == 'delegate' || role == 'candidate')){
          if (Meteor.user().isPublic){
            Roles.addUsersToRoles(Meteor.userId(), role);
          }
        } else {
          Roles.addUsersToRoles(Meteor.userId(), role);
        }
      }else{
        console.log("removing role: " + role);
        Roles.removeUsersFromRoles(Meteor.userId(), role);
      }
    },
    getRequests(){
      return Meteor.users.find({});//,{fields: {profile: 1,roles: 1,isPublic: 1,isParty: 1, approvals: 1, emails: 1}}).fetch();
    },
    getProfileUsernameCount(username){
      check(username,String);
      var count = Meteor.users.find({'profile.username': username}).count();
      return count;
    },
    //this function checks the current user's username and id against the existing ones
    //Returns true if username is unique, false otherwise
    updateUsernameIsUnique(username){
      check(username, String);
      var count = Meteor.users.find({"_id":{$ne: Meteor.userId()},"profile.username": {$eq: username}}).count();
      if(count > 0){
        return false;
      }
      return true;
    },
    //TODO: check approvals and roles and send appropriate message
    getApprovalStatus(userId,type){
      console.log('getApprovalStatus being called')
      check(userId,String);
      check(type,String);
      var result = Meteor.users.aggregate([
        { $unwind : "$approvals" },
        {
          $match: {"_id" : userId,"approvals" : {$exists: true}, "approvals.type":{$eq: type}}
        },
        { $sort : { "approvals.createdAt": -1} },
        {
          $project: {
            "_id": 0, 
            "status": "$approvals.status",
          }
        },
        
        { $limit : 1 }
      ]);
      if(result.length>0){
        console.log(result[0].status)
        console.log(result[0])
        return result[0].status;
      }
      return false;
    },
    getDelegateStatus(userId){
      console.log('getDelegateStatus being called')
      check(userId,String);
      return Meteor.call('getApprovalStatus',userId,'delegate');
    },
    getCandidateStatus(userId){
      check(userId,String);
      return Meteor.call('getApprovalStatus',userId,'candidate');;
    },
    searchUsers(search){
      check(search,String);
      var result = Meteor.users.find( { $text: { $search: search } } )
      console.log(result);
    },
    getUserSearchString(userId){
      check(userId,String);
      var result =  Meteor.users.find(
        { $unwind : "$profile" },
        { $match: {"_id" : userId}},
        { $project: {"_id": 0, "searchString": {$concat: ["$profile.firstName"," ","$profile.lastName"," ","$profile.username"]} } }
      );
      if(result.length>0){
        return result[0].searchString;
      }
      return false;
    },
    signupNewsletter(email){
        check(email,String);
        testUser = {
          email:  email,
          password: Random.id()
        };
        testUser._id = Meteor.call('addUser', testUser);
        Roles.addUsersToRoles(testUser._id, "newsletter");
        Meteor.call('sendNewsletterConfirmation',email, (error, response) => {
          if (error){
            return false;
          } else {
            return true
          }
        });

      return false;
    },
    addTagToProfile: function(userId, tag) {
      check(userId, String);
      check(tag, {
        keyword: String, 
        url: String, 
        _id: String });
      Meteor.users.update({_id: userId}, {$push: {'profile.tags': tag} });
    },
    removeTagFromProfile: function(userId, tag) {
      check(userId, String);
      check(tag, {
        keyword: String, 
        url: String, 
        _id: String });
      Meteor.users.update({_id: userId}, {$pull: {'profile.tags': tag} });
    },
    getDelegateVotes: function(vote){
      /* Returns the delegate votes for the current user's ranked delegates 
      that voted for/against, sorted */
      return Ranks.aggregate([
        {
          $match: {
            supporterId: Meteor.userId(), entityType: 'delegate'
          }
        },
        {
          $lookup:{
            from: "delegateVotes",localField: "entityId",foreignField: "delegateId",as: "vote_info"
          }
        },
        {
          $lookup:{
            from: "users",localField: "entityId",foreignField: "_id",as: "user_info"
          }
        }, 
        {
          $project: {ranking: 1, 'vote_info.vote': 1, 'user_info.profile.firstName':1, 'user_info.profile.lastName':1, 'user_info.profile.username':1, 'user_info.profile.photo':1}
        },
        {$sort: {ranking: 1}}
      ])
    }
});

function profileIsComplete(user){
  var profile = {
    username: user.profile.username,
    firstName: user.profile.firstName,
    lastName: user.profile.lastName,
    photo: user.profile.photo,
    bio: user.profile.bio,
    website: user.profile.website,
    tags: user.profile.tags
  };
  var isComplete = true;
  var profileFields = _.keys(profile);
  public = profile;
  if (profile.tags.length < 5){
    isComplete = false;
  } else {
    _.map(profileFields, function(field){
      if (profile[field].length == 0){
        isComplete = false;
      } 
    });
  }
  return isComplete;
}


