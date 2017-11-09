import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { Random } from 'meteor/random';
import './methods.js';

if (Meteor.isServer) {
  let testRank;
  beforeEach(function () {

  });
  describe('Rank methods', () => {
    it("Add rank", (done) => {
      try {
        testRank = Meteor.call('addRank', "delegate",Random.id(),Random.id(),Random.fraction());
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Get rank", (done) => {
      try {
        Meteor.call('getRank', testRank);
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Delete rank", (done) => {
      try {
        Meteor.call('deleteRank', testRank);
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

  });
}