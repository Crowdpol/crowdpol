import { Meteor } from 'meteor/meteor';
import { fakerSchema } from '../../../utils/test-utils/faker-schema/';
import { assert } from 'meteor/practicalmeteor:chai';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { Random } from 'meteor/random';
import './publications.js';
import { Factory } from 'meteor/dburles:factory';

const { schema, generateDoc } = fakerSchema;

describe('Rank publications', function () {
  beforeEach(function () {
    // create a fake user
    Factory.define('user', Meteor.users, schema.User);
    const userId = Factory.create('user')._id
    // stub Meteor's user method to simulate a logged in user
    stub = sinon.stub(Meteor, 'userId');
    stub.returns(userId)
    Meteor.call('addRank', "delegate", Random.id(), Random.fraction());
    sinon.restore(Meteor, 'userId');
  });

  describe('ranks', function () {

    it('sends all ranks', function (done) {
      const collector = new PublicationCollector();
      collector.collect('ranks.all', (collections) => {
        assert.equal(collections.ranks.length, 1);
        done();
      });
    });
  });
});
