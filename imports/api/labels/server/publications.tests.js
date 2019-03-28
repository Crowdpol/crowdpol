import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';

import './publications.js';


describe('labels publications', function () {
  beforeEach(function () {
    communityId = "123456789";
    Meteor.call('addLabel', "testing",communityId);
  });

  describe('labels', function () {
    it('sends all labels', function (done) {
      const collector = new PublicationCollector();
      collector.collect('labels.community', communityId, (collections) => {
        assert.equal(collections.labels.length, 1);
        done();
      });
    });
  });
});
