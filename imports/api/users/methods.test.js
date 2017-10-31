// Tests for links methods
//
// https://guide.meteor.com/testing.html

import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import './methods.js';

if (Meteor.isServer) {
  let testUser;
  beforeEach(function () {
    Meteor.users.remove({});
  });
  describe('Users', () => {
    it("Add User", (done) => {
      testUser = {
        username: "test_user",
        email:  "brett@numbcity.co.za",
        password: 'test',
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
              "source" : "default",
              "URL" : "https://www.commondemocracy.org/",
              "validated" : true
            }
          ]
        }
      };
      try {
        testUser._id = Meteor.call('addUser', testUser);
        console.log(Accounts.users.find({_id: testUser._id}).fetch());
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Get user", (done) => {
      try {
        Meteor.call('getUser', testUser._id);
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });
    it("Delete user", (done) => {
      try {
        Meteor.call('deleteUser', testUser._id);
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });
  });
}