import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Random } from 'meteor/random'

Meteor.methods({
    addUser: function (newUser) {
      console.log("method addUser called");
      check(newUser, { email: String, password: String });
      userId = Accounts.createUser(newUser);
      return userId;
    },
    getUser: function (userID) {
      console.log("method getUser called");
      check(userID, String);
      const users = Meteor.users.find({_id: userID}).fetch();
        eturn users[0];
    }
});
