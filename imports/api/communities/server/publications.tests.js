import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import './publications.js';
import { Factory } from 'meteor/dburles:factory';
import { fakerSchema } from '../../../utils/test-utils/faker-schema/';

const { schema, generateDoc } = fakerSchema;
/*
describe('Community publications', function () {
  beforeEach(function () {
    community = Factory.create('community', generateDoc(schema.Community))
  });

  describe('community', function () {

    it('publishes all communities', function (done) {
      const collector = new PublicationCollector();
      collector.collect('communities.all', (collections) => {
        assert.equal(collections.communities.length, 1);
        done();
      });
    });
  });
});
*/