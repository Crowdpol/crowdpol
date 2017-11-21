import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { Random } from 'meteor/random';
import './publications.js';
import { Factory } from 'meteor/dburles:factory';

describe('Rank publications', function () {
  beforeEach(function () {
    // stub Meteor's user method to simulate a logged in user
    stub = sinon.stub(Meteor, 'user');
    stub.returns(user)
    Meteor.call('addRank', "delegate", Random.id(), Random.fraction());
    sinon.restore(Meteor, 'user');
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
