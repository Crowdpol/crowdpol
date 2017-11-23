// Tests for links methods
//
// https://guide.meteor.com/testing.html

import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { expect } from 'meteor/practicalmeteor:chai';
import './methods.js';
import { Factory } from 'meteor/dburles:factory';
import { fakerSchema } from '../../utils/test-utils/faker-schema/';
import { sinon } from 'meteor/practicalmeteor:sinon';
import { resetDatabase } from 'meteor/xolvio:cleaner';

const { schema, generateDoc } = fakerSchema;
Factory.define('user', Meteor.users, schema.User);

// Test data and other messy stuff

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
    
    beforeEach(()=>{
      Factory.define('user', Meteor.users, schema.User);
      userId = Factory.create('user', generateDoc(schema.User))._id
    });

    afterEach(()=>{
      resetDatabase();
    });

    describe('Basic User Methods', () => {

      it("Adds a new user", (done) => {
        try {
          var user = Factory.build('user', generateDoc(schema.User))
          var id = Meteor.call('addUser', user);
          expect(Accounts.users.find({_id: id}).count()).to.equal(1);
          done();
        } catch (err) {
          console.log(err);
          assert.fail();
        }
      });

      it("Gets a user", (done) => {
        try {
          var user = Meteor.call('getUser', userId);
          expect(user).to.exist
          done();
        } catch (err) {
          console.log(err);
          assert.fail();
        }
      });

      it("Deletes a user", (done) => {
        try {
          Meteor.call('deleteUser', userId);
          expect(Meteor.call('getUser', userId)).to.not.exist
          done();
        } catch (err) {
          console.log(err);
          assert.fail();
        }
      });
    }); // End of basic method tests

    describe('Methods for Canidates and Delegates', ()=>{
      beforeEach( ()=> {
        // stub Meteor's user method to simulate the entity being logged in
        var stub = sinon.stub(Meteor, 'userId');
        stub.returns(userId)
      });

      afterEach(()=>{
        sinon.restore(Meteor, 'userId');
      });

      it("Toggles user role", (done) => {
        try {
          // Add a role
          Meteor.call('toggleRole', userId, 'delegate', true);
          var user = Meteor.call('getUser', userId);
          expect(user.roles).to.include('delegate'); 
          // Remove a role
          Meteor.call('toggleRole', userId, 'delegate', false);
          var user = Meteor.call('getUser', userId);
          expect(user.roles).to.not.include('delegate');     
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
          var profile = Meteor.call('getProfile', userId);
          expect(profile).to.exist;
          done();
        } catch (err) {
          console.log(err);
          assert.fail();
        }
      });

      it("Updates a user's profile", (done) => {
        try {
          Meteor.call('updateProfile', userId, updateProfile);
          var user = Meteor.call('getUser', userId);
          expect(user.profile.firstName).to.equal(updateProfile.firstName)
          expect(user.profile.lastName).to.equal(updateProfile.lastName)
          done();
        } catch (err) {
          console.log(err);
          assert.fail();
        }
      });

      it("Adds a tag to the user's profile", (done) => {
        try {
          Meteor.call('addTagToProfile', userId, {text: 'Text', keyword: 'text', url: '', id: '1234'});
          var user = Meteor.call('getUser', userId);
          expect(user.profile.tags).to.have.lengthOf(1);
          done();
        } catch (err) {
          console.log(err);
          assert.fail();
        }
      });

      it("Fetches tags on user's profile", (done) => {
        try {
          Meteor.call('addTagToProfile', userId, {text: 'Text', keyword: 'text', url: '', id: '1234'});
          var tags = Meteor.call('getUserTags', userId);
          expect(tags).to.have.lengthOf(1);
          expect(tags[0].text).to.equal('Text');
          done();
        } catch (err) {
          console.log(err);
          assert.fail();
        }
      });

      it("Removes a tag from the user's profile", (done) => {
        try {
          Meteor.call('addTagToProfile', userId, {text: 'Text', keyword: 'text', url: '', id: '1234'});
          Meteor.call('removeTagFromProfile', userId, {text: 'Text', keyword: 'text', url: '', id: '1234'});
          var user = Meteor.call('getUser', userId);
          expect(user.profile.tags).to.have.lengthOf(1);
          done();
        } catch (err) {
          console.log(err);
          assert.fail();
        }
      });

      it("Toggles user profile to be public/private", (done) => {
        try {
          // Set to true
          Meteor.call('togglePublic', userId, true);
          var user = Meteor.call('getUser', userId);
          expect(user.isPublic).to.equal(true);
          // Set to false
          Meteor.call('togglePublic', userId, false);
          var user = Meteor.call('getUser', userId);
          expect(user.isPublic).to.equal(false)
          done();
        } catch (err) {
          console.log(err);
          assert.fail();
        }
      });

      it("Checks if user's username is unique", (done) => {
        try {
          Factory.create('user', { 'profile.username': 'username' })
          expect(Meteor.call('updateUsernameIsUnique', 'uniqueUsername')).to.equal(true);
          Factory.create('user', { 'profile.username': 'uniqueUsername' })
          expect(Meteor.call('updateUsernameIsUnique', 'uniqueUsername')).to.equal(false);
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
          var id = Meteor.call('addEntity', entityData);
          entity = Meteor.call('getUser', id);
          expect(entity).to.exist;
          done();
        } catch (err) {
          console.log(err);
          assert.fail();
        }
      });

    }); // End of Entity Methods

    describe('Approvals Methods', () => {

      beforeEach( ()=> {
        testEntityId = Meteor.call('addEntity', entityData);
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
        resetDatabase();
      });

      it("Request admin approval", (done) => {
        try {
          Meteor.call('requestApproval', testEntityId,'delegate');
          var testEntity = Meteor.call('getUser', testEntityId)
          expect(testEntity.approvals).to.have.lengthOf(1);
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
          var testEntity = Meteor.call('getUser', testEntityId)
          expect(testEntity.approvals).to.have.lengthOf(0);
          done();
        } catch (err) {
          console.log(err);
          assert.fail();
        }
      });

      it("Can set user's approvals to approved", (done) => {
        try {
          Meteor.call('requestApproval', testEntityId);
          var testEntity = Meteor.call('getUser', testEntityId)
          var approval = testEntity.approvals[0]
          Meteor.call('approveUser', testEntityId, approval.id, 'Approved','12345');
          testEntity = Meteor.call('getUser', testEntityId)
          expect(testEntity.approvals[0].status).to.equal('Approved')
          done();
        } catch (err) {
          console.log(err);
          assert.fail();
        }
      });

      it("Determines if a user has pending approvals", (done) => {
        try {
          Meteor.call('requestApproval', testEntityId,'delegate');
          var testEntity = Meteor.call('getUser', testEntityId)
          expect(Meteor.call('isApproved', testEntityId)).to.equal(false);
          var approval = testEntity.approvals[0]
          Meteor.call('approveUser', testEntityId, approval.id, 'Approved','12345');
          expect(Meteor.call('isApproved', testEntityId)).to.equal(true);
          done();
        } catch (err) {
          console.log(err);
          assert.fail();
        }
      });

    }); // End of Approvals Methods

  }) // End of user method tests
}