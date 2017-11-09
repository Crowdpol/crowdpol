// Tests for the behavior of the links collection
//
// https://guide.meteor.com/testing.html

import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Factory } from 'meteor/dburles:factory';
import { fakerSchema } from '../../utils/test-utils/faker-schema/';
import { User } from './Users.js';

if (Meteor.isServer) {
  beforeEach(function () {
    resetDatabase();
  });

  const { schema, generateDoc } = fakerSchema;

  Factory.define('user', User);

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

  describe('User schema', function () {
    /*
    //NOTE: improve this test with Faker schema
    it('inserts cleanly', function() {
      const testDoc = generateDoc(schema.User)
      console.log(testDoc)
      const tag = Factory.create('user', testDoc);
    });
    */
    it('insert correctly', function () {
      const userId = Accounts.createUser(testUser);
      const added = Meteor.users.find({ _id: userId });
      const collectionName = added._getCollectionName();
      const count = added.count();

      assert.equal(collectionName, 'users');
      assert.equal(count, 1);
    });
  });
}
