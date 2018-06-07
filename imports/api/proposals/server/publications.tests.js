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
    user = Factory.create('user');
    tag = Factory.create('tag', generateDoc(schema.Tag));
    tagText = tag.text;
    tagKeyword = tag.keyword;
    tagId = tag._id;
    tagUrl = tag.url;
    community = Factory.create('community', generateDoc(schema.Community));
    communityId = community._id;
    userId = user._id

    proposal = {
          title: 'Test Proposal',
          abstract: 'This proposal will test the proposals',
          body: 'I hereby propose a proposal to test the proposals so that others, too, may propose proposals.',
          startDate: new Date(),
          endDate: new Date(),
          authorId: userId,
          invited: ['invitedGuy', 'otherInvitedGuy'],
          tags: [{text: tagText, keyword: tagKeyword, _id: tagId, url: tagUrl}],
          pointsFor: ['point1','point2'],
          pointsAgainst: ['point1','point2'],
          references: ['ref1','ref2'],
          communityId: communityId
        }
        
        propsalId = Meteor.call('createProposal', proposal);
  });

  describe('proposals', function () {

    it('publishes all community proposals', function (done) {
      const collector = new PublicationCollector();
      collector.collect('proposals.community', communityId, (collections) => {
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
      collector.collect('proposals.public','',communityId, (collections) => {
        assert.equal(collections.proposals.length, 0);
        //Make propsal live
        //Meteor.call('approveProposal', propsalId);
        done();
      });
    });

    it('publishes proposals authored by the logged-in user', function (done) {
      const collector = new PublicationCollector({ userId: userId });
      collector.collect('proposals.author','',communityId, (collections) => {
        assert.equal(collections.proposals.length, 1);
        done();
      });
    });

    it('publishes proposals for a specific invitee', function (done) {
      const collector = new PublicationCollector();
      collector.collect('proposals.invited', 'invitedGuy',communityId, (collections) => {
        assert.equal(collections.proposals.length, 0);
        done();
      });
    });

    it('publishes proposals with a specific tag', function (done) {
      const collector = new PublicationCollector();
      collector.collect('proposals.withTag', tag.keyword,communityId, (collections) => {
        assert.equal(collections.proposals.length, 1);
        done();
      });
    });


  });
});
