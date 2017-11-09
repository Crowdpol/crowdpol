import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { Random } from 'meteor/random';
import './publications.js';


describe('Rank publications', function () {
  beforeEach(function () {
    Meteor.call('addRank', "delegate",Random.id(),Random.id(),Random.fraction());
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
