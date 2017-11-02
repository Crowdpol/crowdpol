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