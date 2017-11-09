import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import './publications.js';


describe('Proposal publications', function () {
  beforeEach(function () {
    let title = 'Test Proposal'
        let abstract = 'This proposal will test the proposals'
        let body = 'I hereby propose a proposal to test the proposals so that others, too, may propose proposals.'
        let startDate = new Date()
        let endDate = new Date()
        let authorId = '213924230'
        Meteor.call('createProposal', title, abstract, body, startDate, endDate, authorId);
  });

  describe('proposals', function () {
    it('publishes all proposals', function (done) {
      const collector = new PublicationCollector();
      collector.collect('proposals.all', (collections) => {
        assert.equal(collections.proposals.length, 1);
        done();
      });
    });
  });
});
