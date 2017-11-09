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
  describe('User methods', () => {
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

    it("Creates an entity", (done) => {
      entityData = {
        email:  "organisation@test.co.za",
        password: 'test',
        name: "Organisation",
        website: "http://testuser.com",
        phone: '09324802394',
        contact: 'Contact McContact',
        roles: 'organisation-delegate'
      };
      try {
        Meteor.call('addEntity', entityData);
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Can determine if a user has pending approvals", (done) => {
      try {
        testEntityID = Meteor.call('addEntity', entityData);
        Meteor.call('isApproved', testEntityID);
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Can clear a user's approvals", (done) => {
      try {
        testEntityID = Meteor.call('addEntity', entityData);
        Meteor.call('addApproval', testEntityID, {approved: false, type: 'organisation-delegate'});
        Meteor.call('clearApprovals', testEntityID);
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Can set user's approvals to approved", (done) => {
      try {
        testEntityID = Meteor.call('addEntity', entityData);
        Meteor.call('addApproval', testEntityID, {approved: false, type: 'organisation-delegate'});
        Meteor.call('approveUser', testEntityID);
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    })


  });
  
}