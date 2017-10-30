// Tests for the behavior of the links collection
//
// https://guide.meteor.com/testing.html

import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { Users } from './Users.js';

if (Meteor.isServer) {
  let testUser;
  describe('Users', () => {
      it("Add User", (done) => {

          testUser = {email: 'test@test.test', password: 'test'};

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
  });
}