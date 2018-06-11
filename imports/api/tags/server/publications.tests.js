import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';

import './publications.js';


describe('Tag publications', function () {
  beforeEach(function () {
    communityId = "123456789";
    Meteor.call('addTag', "testing",communityId);
  });

  describe('tags', function () {
    it('sends all tags', function (done) {
      const collector = new PublicationCollector();
      collector.collect('tags.community', communityId, (collections) => {
        assert.equal(collections.tags.length, 1);
        done();
      });
    });
  });
});
