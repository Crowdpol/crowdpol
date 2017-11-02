import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import './publications.js';


describe('Tag publications', function () {
  beforeEach(function () {
    Meteor.call('addTag', "testing");
  });

  describe('tags', function () {
    it('sends all tags', function (done) {
      const collector = new PublicationCollector();
      collector.collect('tags.all', (collections) => {
        assert.equal(collections.tags.length, 1);
        done();
      });
    });
  });
});
