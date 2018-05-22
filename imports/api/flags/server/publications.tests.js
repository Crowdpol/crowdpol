import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import './publications.js';


describe('Flag publications', function () {
  beforeEach(function () {
    Meteor.call('addTag', "testing");
  });

  describe('flags', function () {
    it('sends all flags', function (done) {
      const collector = new PublicationCollector();
      collector.collect('flags.all', (collections) => {
        assert.equal(collections.flags.length, 1);
        done();
      });
    });
  });
});
