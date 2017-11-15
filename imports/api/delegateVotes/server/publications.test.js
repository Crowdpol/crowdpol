import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { DelegateVotes } from '../DelegateVotes.js'
import './publications.js';


describe('DelegateVotes publications', function () {
  beforeEach(function () {
    let vote = {message: 'Test vote', proposalId: '01234', delegateId: '56789'};
    DelegateVotes.insert(vote);
  });

  describe('DelegateVotes', function () {
    it('publishes all delegate votes for a given proposal', function (done) {
      const collector = new PublicationCollector();
      collector.collect('delegateVotes.forProposal', '01234', (collections) => {
        assert.equal(collections.delegateVotes.length, 1);
        done();
      });
    });

    it('publishes all votes for a given delegate', function (done) {
      const collector = new PublicationCollector();
      collector.collect('delegateVotes.forDelegate', '56789', (collections) => {
        assert.equal(collections.delegateVotes.length, 1);
        done();
      });
    });

  });
});
