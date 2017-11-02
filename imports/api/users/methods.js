import { check } from 'meteor/check';
import { Random } from 'meteor/random';

Meteor.methods({

    addUser: function (newUser) {
      //console.log("method addUser called");
      //check(newUser, { email: String, password: String });
      userId = Accounts.createUser(newUser);
      return userId;
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
      console.log(users);
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
        'password': entity.password
        });

      // Update profile
      profile = {'firstName': entity.name,
      'website': entity.website,
      'phoneNumber': entity.phone,
      'contactPerson': entity.contact}

      Meteor.call('updateProfile', entityID, profile)

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
    approveUser: function(userID, approverID){
      user = Meteor.call('getUser', userID);
      approvals = user.profile.approvals;
      for (i=0; i<approvals.length; i++){
        approvals[i].approved = true;
        approvals[i].approvedBy = approverID;
        approvals[i].approvedOn = new Date();
        Meteor.users.update({_id: userID}, {$set: {'profile.approvals': approvals}});
      }
    }
    'user.delete'(userId) {
      Meteor.users.remove({_id:userId});
    },
    requestApproval: function (userID,type) {
      check(userID, String);
      check(type, String);
      let request = [
            {
              "type" : 'delegate-individual',
              "approved" : false,
              "createdAt" : new Date(),
            }
          ];
      Meteor.users.update({_id: Meteor.userId()}, {$set: {"approvals": request}});
    },
    toggleDelegate: function (userID,isDelegate) {
      check(userID, String);
      check(isDelegate, Boolean);
      if(isDelegate){
        Roles.removeUsersFromRoles(Meteor.userId(), 'delegate');
      }else{
        Roles.addUsersToRoles(Meteor.userId(), 'delegate');
      }
    },
});