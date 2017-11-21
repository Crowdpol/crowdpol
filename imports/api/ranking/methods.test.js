import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { Random } from 'meteor/random';
import { Factory } from 'meteor/dburles:factory';
import { fakerSchema } from '../../utils/test-utils/faker-schema/';
import './methods.js';

const { schema, generateDoc } = fakerSchema;

if (Meteor.isServer) {
  let testRank;
  describe('Rank methods', () => {
    beforeEach(function () {
    // create a fake user
    Factory.define('user', Meteor.users, schema.User);
    const userId = Factory.create('user')._id
    // stub Meteor's user method to simulate a logged in user
    stub = sinon.stub(Meteor, 'userId');
    stub.returns(userId)
  });

    afterEach(function () {
      sinon.restore(Meteor, 'userId');
    });

    it("Add rank", (done) => {
      try {
        testRank = Meteor.call('addRank', "delegate", Random.id(), Random.fraction());
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Get rank", (done) => {
      try {
        Meteor.call('getRank', testRank[0]._id);
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Delete rank", (done) => {
      try {
        Meteor.call('deleteRank', testRank[0]._id);
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

  });
}