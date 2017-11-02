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
      console.log('2')
      user = Meteor.call('getUser', userID);
      if (!user.profile.approvals){
        console.log('3')
        Meteor.users.update({_id: userID}, {$set: {"profile.approvals": [approval]}});
        console.log('4')
      } else {
        console.log('5')
        Meteor.users.update({_id: userID},{ $push: {"profile.approvals": approval}});
      }
    },
    createEntity: function(entity) {
      console.log('-1');
      entityID = Accounts.createUser({
        'email': entity.email,
        'password': entity.password,
        'profile.firstName': entity.name,
        'profile.website': entity.website,
        'profile.phoneNumber': entity.phone,
        'profile.contactPerson': entity.contact,
        'profile.approvals': [{type: entity.roles[0], approved: false}]
        });

      /*// Add entity to role
      Roles.addUsersToRoles(entityID, entity.roles);

      // Add pending approval
      console.log('0')
      approval = {type: entity.roles[0], approved: false}
      console.log('1')
      Meteor.call('addApproval', entityID, approval);
      console.log('6')*/
    }
});