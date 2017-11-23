import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { Random } from 'meteor/random';
import { Factory } from 'meteor/dburles:factory';
import { fakerSchema } from '../../utils/test-utils/faker-schema/';
import './methods.js';

const { schema, generateDoc } = fakerSchema;

if (Meteor.isServer) {
  describe('Rank methods', () => {
    beforeEach(function () {
    // create a fake user
    Factory.define('user', Meteor.users, schema.User);
    const userId = Factory.create('user')._id
    // stub Meteor's user method to simulate a logged in user
    stub = sinon.stub(Meteor, 'userId');
    stub.returns(userId)
    testRank = Meteor.call('addRank', "delegate", Random.id(), Random.fraction());
  });

    afterEach(function () {
      sinon.restore(Meteor, 'userId');
    });

    it("Add rank", (done) => {
      try {
        var testRank = Meteor.call('addRank', "delegate", Random.id(), Random.fraction());
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Remove rank", (done) => {
      try {
        var testRank = Meteor.call('removeRank', "delegate", Random.id());
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

    it("Get ranks", (done) => {
      try {
        testRank = Meteor.call('getRanks',Random.id(), "delegate");
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Update ranks", (done) => {
      try {
        testRank = Meteor.call('updateRanks', [Random.id(), Random.id(), Random.id()], "delegate");
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

  });
}