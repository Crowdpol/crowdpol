import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import './publications.js';
import { Factory } from 'meteor/dburles:factory';
import { fakerSchema } from '../../../utils/test-utils/faker-schema/';

const { schema, generateDoc } = fakerSchema;

describe('Proposal publications', function () {
  beforeEach(function () {
    // create a fake user
    Factory.define('user', Meteor.users, schema.User);
    userId = Factory.create('user')._id
    tag = Factory.create('tag', generateDoc(schema.Tag))
    proposal = {
          title: 'Test Proposal',
          abstract: 'This proposal will test the proposals',
          body: 'I hereby propose a proposal to test the proposals so that others, too, may propose proposals.',
          startDate: new Date(),
          endDate: new Date(),
          authorId: userId,
          invited: ['invitedGuy', 'otherInvitedGuy'],
          tags: [{text: tag.text, keyword: tag.keyword, _id: tag._id, url: tag.url}]
        }
        
        propsalId = Meteor.call('createProposal', proposal);
  });

  describe('proposals', function () {

    it('publishes all proposals', function (done) {
      const collector = new PublicationCollector();
      collector.collect('proposals.all', (collections) => {
        assert.equal(collections.proposals.length, 1);
        done();
      });
    });

    it('publishes one proposal', function (done) {
      const collector = new PublicationCollector();
      collector.collect('proposals.one', propsalId, (collections) => {
        assert.equal(collections.proposals.length, 1);
        done();
      });
    });

    it('publishes live proposals', function (done) {
      const collector = new PublicationCollector();
      collector.collect('proposals.public', (collections) => {
        assert.equal(collections.proposals.length, 0);
        //Make propsal live
        //Meteor.call('approveProposal', propsalId);
        done();
      });
    });

    it('publishes proposals authored by the logged-in user', function (done) {
      const collector = new PublicationCollector({ userId: userId });
      collector.collect('proposals.author', (collections) => {
        assert.equal(collections.proposals.length, 1);
        done();
      });
    });

    it('publishes proposals for a specific invitee', function (done) {
      const collector = new PublicationCollector();
      collector.collect('proposals.invited', 'invitedGuy', (collections) => {
        assert.equal(collections.proposals.length, 1);
        done();
      });
    });

    it('publishes proposals with a specific tag', function (done) {
      const collector = new PublicationCollector();
      collector.collect('proposals.withTag', tag.keyword, (collections) => {
        assert.equal(collections.proposals.length, 1);
        done();
      });
    });


  });
});
