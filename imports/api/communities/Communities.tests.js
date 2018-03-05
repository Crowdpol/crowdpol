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
  Factory.define('user', Meteor.users, schema.User);

  describe('User schema', function () {
    it('insert correctly', function () {
      const userId = Factory.create('user')._id
      const added = Meteor.users.find({ _id: userId });
      const collectionName = added._getCollectionName();
      const count = added.count();

      assert.equal(collectionName, 'users');
      assert.equal(count, 1);
    });
  });
}
