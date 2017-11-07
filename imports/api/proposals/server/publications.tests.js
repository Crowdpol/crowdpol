import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import './publications.js';


describe('Proposal publications', function () {
  beforeEach(function () {
    proposal = {
          title: 'Test Proposal',
          abstract: 'This proposal will test the proposals',
          body: 'I hereby propose a proposal to test the proposals so that others, too, may propose proposals.',
          startDate: new Date(),
          endDate: new Date(),
          authorId: '213924230'
        }
        
        testProposal = Meteor.call('createProposal', proposal);
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
