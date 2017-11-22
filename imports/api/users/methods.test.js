// Tests for links methods
//
// https://guide.meteor.com/testing.html

import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import './methods.js';
import { Factory } from 'meteor/dburles:factory';
import { fakerSchema } from '../../utils/test-utils/faker-schema/';
import { sinon } from 'meteor/practicalmeteor:sinon';

const { schema, generateDoc } = fakerSchema;

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
    it("Creates an entity", (done) => {
      entityData = {
        email:  "organisation@test.co.za",
        password: 'test',
        name: "Organisation",
        website: "http://testuser.com",
        phone: '09324802394',
        contact: 'Contact McContact',
        roles: 'delegate'
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
        entityData = {
        email:  "organisation@test.co.za",
        password: 'test',
        name: "Organisation",
        website: "http://testuser.com",
        phone: '09324802394',
        contact: 'Contact McContact',
        roles: 'delegate'
      };
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
        entityData = {
        email:  "organisation@test.co.za",
        password: 'test',
        name: "Organisation",
        website: "http://testuser.com",
        phone: '09324802394',
        contact: 'Contact McContact',
        roles: 'delegate'
      };
        var testEntityId = Meteor.call('addEntity', entityData);
        var testEntity = Meteor.call('getUser', testEntityId)
        // stub Meteor's user method to simulate the entity being logged in
        var userStub = sinon.stub(Meteor, 'user');
        var idStub = sinon.stub(Meteor, 'userId');
        userStub.returns(testEntity)
        idStub.returns(testEntityId)
        Meteor.call('requestApproval', testEntityId,'delegate');
        Meteor.call('clearApprovals', testEntityId);
        sinon.restore(Meteor, 'user');
        sinon.restore(Meteor, 'userId');
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Can set user's approvals to approved", (done) => {
      try {
        entityData = {
        email:  "organisation@test.co.za",
        password: 'test',
        name: "Organisation",
        website: "http://testuser.com",
        phone: '09324802394',
        contact: 'Contact McContact',
        roles: 'delegate'
      };
        var testEntityId = Meteor.call('addEntity', entityData);
        var testEntity = Meteor.call('getUser', testEntityId)
        // stub Meteor's user method to simulate the entity being logged in
        var userStub = sinon.stub(Meteor, 'user');
        var idStub = sinon.stub(Meteor, 'userId');
        userStub.returns(testEntity)
        idStub.returns(testEntityId)
        Meteor.call('requestApproval', testEntityId,'delegate');
        Meteor.call('approveUser', testEntityId);
        sinon.restore(Meteor, 'user');
        sinon.restore(Meteor, 'userId');
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    })
    it("Request admin approval", (done) => {
      try {
        // create a fake user
        Factory.define('user', Meteor.users, schema.User);
        const userId = Factory.create('user')._id
        const user = Meteor.call('getUser', userId);
        // stub Meteor's user method to simulate a logged in user
        stub = sinon.stub(Meteor, 'user');
        stub.returns(user)
        Meteor.call('requestApproval', testUser._id,'delegate');
        sinon.restore(Meteor, 'user');
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });
  });
  
}