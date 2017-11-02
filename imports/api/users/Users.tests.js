// Tests for the behavior of the links collection
//
// https://guide.meteor.com/testing.html

import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { Users } from './Users.js';

if (Meteor.isServer) {
  beforeEach(function () {
    Meteor.users.remove({});
  });

  var testUser = {
    createdAt: new Date(),
    username: "test_user",
    password: 'test',
    services: {},
    profile: {
      firstName: "Test",
      lastName: "User",
      birthday: new Date(),
      gender: "Other",
      organization: "Test Org",
      website: "http://testuser.com",
      bio: "I am a test user",
      picture: "/img/default-user-image.png",
      credentials : [
        {
          "source" : "test",
          "URL" : "https://www.commondemocracy.org/",
          "validated" : true
        }
      ]
    },
    roles: ["test"],
  }

  describe('users collection', function () {
    it('insert correctly', function () {
      const userId = Accounts.createUser(testUser);
      const added = Meteor.users.find({ _id: userId });
      console.log(added);
      const collectionName = added._getCollectionName();
      const count = added.count();

      assert.equal(collectionName, 'users');
      assert.equal(count, 1);
    });
  });
}
