import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { Votes } from '../Votes.js'
import './publications.js';


describe('Votes publications', function () {
  beforeEach(function () {
    let vote = {message: 'Test vote', proposalId: '01234', voterHash: '56789'};
    Votes.insert(vote);
  });

  describe('votes', function () {
    it('publishes all votes for a given proposal', function (done) {
      const collector = new PublicationCollector();
      collector.collect('votes.forProposal', '01234', (collections) => {
        assert.equal(collections.votes.length, 1);
        done();
      });
    });

    it('publishes all votes for a given user', function (done) {
      const collector = new PublicationCollector();
      collector.collect('votes.forUser', '56789', (collections) => {
        assert.equal(collections.votes.length, 1);
        done();
      });
    });

  });
});
