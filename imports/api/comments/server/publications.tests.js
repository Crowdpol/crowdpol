import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { Comments } from '../Comments.js'
import { fakerSchema } from '../../../utils/test-utils/faker-schema/';
import './publications.js';
import { resetDatabase } from 'meteor/xolvio:cleaner';

const { schema, generateDoc } = fakerSchema;

describe('Comments publications', function () {
  beforeEach(function () {
    proposal = Factory.create('proposal', generateDoc(schema.Proposal));
    proposalId = proposal._id
    let comment = {message: 'Test comment', proposalId: proposalId, authorId: '23049234'};
    Comments.insert(comment);
  });

  describe('comments', function () {

    it('publishes comments for a proposal', function (done) {
      const collector = new PublicationCollector();
      collector.collect('comments', proposalId, (collections) => {
        assert.equal(collections.comments.length, 1);
        done();
      });
    });

    it('publishes all comments', function (done) {
      const collector = new PublicationCollector();
      collector.collect('comments.all', (collections) => {
        assert.equal(collections.comments.length, 1);
        done();
      });
    });


  });
});
