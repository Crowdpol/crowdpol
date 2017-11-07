import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { Comments } from '../Comments.js'
import './publications.js';


describe('Comments publications', function () {
  beforeEach(function () {
    let comment = {message: 'Test comment', proposalId: '9234823', authorId: '23049234'};
    Comments.insert(comment);
  });

  describe('comments', function () {
    it('publishes all comments', function (done) {
      const collector = new PublicationCollector();
      collector.collect('comments.all', (collections) => {
        assert.equal(collections.comments.length, 1);
        done();
      });
    });
  });
});
