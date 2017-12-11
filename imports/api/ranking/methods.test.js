import { Meteor } from 'meteor/meteor';
import { assert, expect } from 'meteor/practicalmeteor:chai';
import { Random } from 'meteor/random';
import { Factory } from 'meteor/dburles:factory';
import { fakerSchema } from '../../utils/test-utils/faker-schema/';
import { Ranks } from './Ranks.js';
import './methods.js';

const { schema, generateDoc } = fakerSchema;

if (Meteor.isServer) {
  describe('Rank methods', () => {

    beforeEach(function () {
      // create a fake user
      Factory.define('user', Meteor.users, schema.User);
      userId = Factory.create('user')._id
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
        var ranks = Meteor.call('addRank', "delegate", Random.id(), Random.fraction());
        expect(ranks).to.exist;
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Remove rank", (done) => {
      try {
        var remainingRanks = Meteor.call('removeRank', "delegate", testRank[0])
        expect(remainingRanks).to.have.lengthOf(0);
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Get rank", (done) => {
      try {
        var id = Ranks.find().fetch()[0]._id;
        var rank = Meteor.call('getRank', id);
        expect(rank).to.exist;
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Delete rank", (done) => {
      try {
        var id = Meteor.call('deleteRank', testRank[0]._id);
        expect(Meteor.call('getRank', id)).to.not.exist;
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Get ranks", (done) => {
      try {
        _.map([1,2,3,4], function(){ Meteor.call('addRank', "delegate", Random.id(), Random.fraction()) })
        var ranks = Meteor.call('getRanks', userId, "delegate");
        expect(ranks).to.have.lengthOf(5);
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Update ranks", (done) => {
      try {
        _.map([1,2,3,4], function(){ Meteor.call('addRank', "delegate", Random.id(), Random.fraction()) })
        var ranks = Meteor.call('getRanks', userId, "delegate");
        testRank = Meteor.call('updateRanks', ranks, "delegate");
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

  });
}