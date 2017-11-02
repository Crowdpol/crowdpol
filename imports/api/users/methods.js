import { check } from 'meteor/check';
import { Random } from 'meteor/random';

Meteor.methods({

    addUser: function (newUser) {
      console.log("method addUser called");
      //check(newUser, { email: String, password: String });
      userId = Accounts.createUser(newUser);
      return userId;
    },
    getUser: function (userID) {
      console.log("method getUser called");
      check(userID, String);
      const users = Meteor.users.find({_id: userID}).fetch();
        return users[0];
    },
    deleteUser: function (userID) {
      console.log("method deleteUser called");
      check(userID, String);
      Meteor.users.remove({_id:userID});
    },
    getProfile: function (userID) {
      console.log("method getUserProfile called: " + userID);
      check(userID, String);
      const users = Meteor.users.find({_id: userID},{fields: {profile: 1, isPublic:1}}).fetch();
      console.log(users);
      return users[0];
    },
    updateProfile: function (userID, profile) {
      console.log(profile);
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
    createEntity: function(entity) {
      entityID = Accounts.createUser({
        'email': entity.email,
        'password': entity.password,
        'profile.firstName': entity.name,
        'profile.website': entity.website,
        'profile.phoneNumber': entity.phone,
        'profile.contactPerson': entity.contact
        });

      // Add entity to role
      Roles.addUsersToRoles(entityID, entity.roles);

      //Add approval
      Meteor.call('addApproval', entityID, {type: entity.roles[0], approved: false, createdAt: new Date()})
    },
    isApproved: function(userID) {
      user = Meteor.call('getUser', userID);

      for (i = 0; i < user.profile.approvals.length(); i++){
        if (!user.profile.approvals[i].approved){
          return false;
        }
      }

      return true;

    }
});