import { check } from 'meteor/check';
import { Random } from 'meteor/random';

Meteor.methods({

    addUser: function (newUser) {
      //console.log("method addUser called");
      //check(newUser, { email: String, password: String });
      userId = Accounts.createUser(newUser);
      return userId;
    },
    isPublic: function (userId) {

      user = Meteor.users.findOne({_id: Meteor.userId()},{fields: {profile: 1,roles: 1,isPublic: 1,isParty: 1,isOrganisation: 1}});;
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
    updateProfile: function (userID, profile) {
      //console.log(profile);
      check(userID, String);
      Meteor.users.update({_id: userID}, {$set: {"profile": profile}});
    },
    togglePublic: function (userID,isPublic) {
      check(userID, String);
      check(isPublic, Boolean);
      Meteor.users.update({_id: userID}, {$set: {"isPublic": isPublic}});
    },
    toggleParty: function (userID,isParty) {
      check(userID, String);
      check(isParty, Boolean);
      Meteor.users.update({_id: userID}, {$set: {"isParty": isParty}});
    },
    toggleOrg: function (userID,isOrg) {
      check(userID, String);
      check(isOrg, Boolean);
      Meteor.users.update({_id: userID}, {$set: {"isOrganisation": isOrg}});
    },
    addApproval: function(userID, approval) {
      user = Meteor.call('getUser', userID);
      if (!user.profile.approvals){
        Meteor.users.update({_id: userID}, {$set: {"profile.approvals": [approval]}});
      } else {
        Meteor.users.update({_id: userID},{ $push: {"profile.approvals": approval}});
      }
    },
    addEntity: function(entity) {
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
      'type': entity.profileType};

      Meteor.call('updateProfile', entityID, profile);
      Meteor.call('toggleParty', entityID,entity.isParty);
      Meteor.call('toggleOrg', entityID,entity.isOrganisation);

      // Add entity to role
      Roles.addUsersToRoles(entityID, entity.roles);

      return entityID;

    },
    isApproved: function(userID) {
      user = Meteor.call('getUser', userID);

      if (user.profile.approvals){
        for (i = 0; i < user.profile.approvals.length; i++){
          if (!user.profile.approvals[i].approved){
            return false;
          }
        }
      } else {
        return false;
      }

      return true;

    },
    clearApprovals: function(userID){
      Meteor.users.update({_id: userID}, {$set: {"profile.approvals": []}});
    },
    approveUser: function(userID, requestId,status,approverID){
      user = Meteor.users.findOne({_id: userID,"approvals" : {$exists: true}, $where : "this.approvals.length > 0"});
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
      if(type){
        Roles.addUsersToRoles(userID, type);
      }
    },
    'user.delete'(userId) {
      Meteor.users.remove({_id:userId});
    },
    requestApproval: function (userID,type) {
      //get current user approvalReqeusts
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
    },
    toggleRole: function (userID,role,state) {
      check(userID, String);
      check(role, String);
      check(state, Boolean);
      if(state){
        Roles.removeUsersFromRoles(Meteor.userId(), role);
      }else{
        Roles.addUsersToRoles(Meteor.userId(), role);
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
    checkUpdateUsername(username){
      var count = Meteor.users.find({"_id":{$ne: Meteor.userId()},"profile.username": {$eq: username}}).count();
      if(count > 0){
        return false;
      }
      return true;
    }
});


