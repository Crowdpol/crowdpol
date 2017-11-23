// Tests for links methods
//
// https://guide.meteor.com/testing.html

import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import './methods.js';
import { Factory } from 'meteor/dburles:factory';
import { fakerSchema } from '../../utils/test-utils/faker-schema/';
import { sinon } from 'meteor/practicalmeteor:sinon';
import { resetDatabase } from 'meteor/xolvio:cleaner';

const { schema, generateDoc } = fakerSchema;

// Test data and other messy stuff
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
    ],
    tags : [
      {
        "text" : "Tag",
        "keyword" : "tag",
        "url" : 'tags/tag',
        "_id" : '123'
      }
    ]
  }
};

updateProfile = {
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

entityData = {
  email:  "organisation@test.co.za",
  password: 'test',
  name: "Organisation",
  website: "http://testuser.com",
  phone: '09324802394',
  contact: 'Contact McContact',
  roles: 'delegate-organisation'
};

if (Meteor.isServer) {

  describe('User Methods', () => {

    beforeEach( ()=> {
      resetDatabase(null);
    });

    describe('Basic User Methods', () => {

      it("Adds a new user", (done) => {
        try {
          testUser._id = Meteor.call('addUser', testUser);
          Accounts.users.find({_id: testUser._id}).fetch();
          done();
        } catch (err) {
          console.log(err);
          assert.fail();
        }
      });

      it("Gets a user", (done) => {
        try {
          Meteor.call('getUser', testUser._id);
          done();
        } catch (err) {
          console.log(err);
          assert.fail();
        }
      });

      it("Deletes a user", (done) => {
        try {
          Meteor.call('deleteUser', testUser._id);
          done();
        } catch (err) {
          console.log(err);
          assert.fail();
        }
      });
    }); // End of basic method tests

    describe('Methods for Canidates and Delegate', ()=>{

      it("Toggles user role", (done) => {
        try {
          Meteor.call('toggleRole', testUser._id, 'delegate', false);
          done();
        } catch (err) {
          console.log(err);
          assert.fail();
        }
      });

    }); //End of Candidates and Delegates Methods

    describe('Profile Methods', () => {

      it("Gets a user's profile", (done) => {
        try {
          Meteor.call('getProfile', testUser._id);
          done();
        } catch (err) {
          console.log(err);
          assert.fail();
        }
      });

      it("Updates a user's profile", (done) => {
        try {
          Meteor.call('updateProfile', testUser._id, updateProfile);
          done();
        } catch (err) {
          console.log(err);
          assert.fail();
        }
      });

      it("Fetches tags on user's profile", (done) => {
        try {
          Meteor.call('getUserTags', testUser._id);
          done();
        } catch (err) {
          console.log(err);
          assert.fail();
        }
      });

      it("Toggles user profile to be public/private", (done) => {
        try {
          Meteor.call('togglePublic', testUser._id, true);
          done();
        } catch (err) {
          console.log(err);
          assert.fail();
        }
      });

      it("Adds a tag to the user's profile", (done) => {
        try {
          Meteor.call('addTagToProfile', testUser._id, {text: 'Text', keyword: 'text', url: '', id: '1234'});
          done();
        } catch (err) {
          console.log(err);
          assert.fail();
        }
      });

      it("Removes a tag from the user's profile", (done) => {
        try {
          Meteor.call('removeTagFromProfile', testUser._id, {text: 'Text', keyword: 'text', url: '', id: '1234'});
          done();
        } catch (err) {
          console.log(err);
          assert.fail();
        }
      });

      it("Removes a tag from the user's profile", (done) => {
        try {
          Meteor.call('checkUpdateUsername', testUser._id, {text: 'Text', keyword: 'text', url: '', id: '1234'});
          done();
        } catch (err) {
          console.log(err);
          assert.fail();
        }
      });
      
    }); // End of Profile Methods

    describe('Entity Methods', () => {

      it("Creates an entity", (done) => {  
        try {
          testEntityId = Meteor.call('addEntity', entityData);
          done();
        } catch (err) {
          console.log(err);
          assert.fail();
        }
      });

    }); // End of Entity Methods

    describe('Approvals Methods', () => {

      beforeEach( ()=> {
        // stub Meteor's user method to simulate the entity being logged in
        var testEntity = Meteor.call('getUser', testEntityId)
        var userStub = sinon.stub(Meteor, 'user');
        var idStub = sinon.stub(Meteor, 'userId');
        userStub.returns(testEntity)
        idStub.returns(testEntityId)
      });

      afterEach(()=>{
        sinon.restore(Meteor, 'user');
        sinon.restore(Meteor, 'userId');
      });

      it("Determines if a user has pending approvals", (done) => {
        try {
          Meteor.call('isApproved', testEntityID);
          done();
        } catch (err) {
          console.log(err);
          assert.fail();
        }
      });

      it("Clears a user's approvals", (done) => {
        try {
          Meteor.call('requestApproval', testEntityId,'delegate');
          Meteor.call('clearApprovals', testEntityId);
          done();
        } catch (err) {
          console.log(err);
          assert.fail();
        }
      });

      it("Can set user's approvals to approved", (done) => {
        try {
          Meteor.call('requestApproval', testEntityId,'delegate');
          Meteor.call('approveUser', testEntityId);
          done();
        } catch (err) {
          console.log(err);
          assert.fail();
        }
      });

      it("Request admin approval", (done) => {
        try {
          // create a fake user
          Factory.define('user', Meteor.users, schema.User);
          const userId = Factory.create('user')._id
          const user = Meteor.call('getUser', userId);
          // stub Meteor's user method to simulate a logged in user
          var adminStub = sinon.stub(Meteor, 'user');
          adminStub.returns(user)
          Meteor.call('requestApproval', testUser._id,'delegate');
          sinon.restore(Meteor, 'user');
          done();
        } catch (err) {
          console.log(err);
          assert.fail();
        }
      });

    }); // End of Approvals Methods

  }) // End of user method tests
}