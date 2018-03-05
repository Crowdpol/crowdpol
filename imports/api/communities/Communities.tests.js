// Tests for the behavior of the links collection
//
// https://guide.meteor.com/testing.html

import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Factory } from 'meteor/dburles:factory';
import { fakerSchema } from '../../utils/test-utils/faker-schema/';
import { Community } from './Communities.js';

if (Meteor.isServer) {
  beforeEach(function () {
    resetDatabase();
  });

  const { schema, generateDoc } = fakerSchema;
  Factory.define('community', communities, schema.Community);

  describe('Community schema', function () {
    it('inserts correctly', function () {
      const communityId = Factory.create('community')._id
      const added = Communities.find({ _id: communityId });
      const collectionName = added._getCollectionName();
      const count = added.count();

      assert.equal(collectionName, 'communities');
      assert.equal(count, 1);
    });
  });
}
