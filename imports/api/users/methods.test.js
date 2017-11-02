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
        Accounts.users.find({_id: testUser._id}).fetch();
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

    let updateProfile = {
          firstName: "Test",
          lastName: "User Updates",
          gender: "Other",
          organization: "Test Org Updated",
          website: "http://testuser.com/update",
          bio: "I am a test user, my profile has been updated",
          picture: "/img/default-user-image.png",
          credentials : [
            {
              "source" : "default",
              "URL" : "https://www.commondemocracy.org/",
              "validated" : true
            }
          ]
    };
    it("Get user profile", (done) => {
      try {
        Meteor.call('getProfile', testUser._id);
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });
    it("Update user profile", (done) => {
      try {
        Meteor.call('updateProfile', testUser._id, updateProfile);
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
    it("Request admin approval", (done) => {
      try {
        Meteor.call('requestApproval', testUser._id,'delegate-individual');
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });
  });
}