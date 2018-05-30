import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'meteor/practicalmeteor:chai';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { Flags } from '../Flags.js'
import { Factory } from 'meteor/dburles:factory';
import { fakerSchema } from '../../../utils/test-utils/faker-schema/';
import './publications.js';

const { schema, generateDoc } = fakerSchema;

describe('Flag publications', function () {
  Factory.define('user', Meteor.users, schema.User);
  creatorId = Factory.create('user')._id;
  flaggerId = Factory.create('user')._id;

  flag = {
    contentType: 'proposal',
    contentId: Random.id(),
    creatorId: creatorId,
    flaggerId: flaggerId,
    category: 'sexist',
    justification: 'I dont like it',
    status: 'pending',
    outcome: 'rejected',
    communityId: creatorId,
    other: ''
  }
  beforeEach(function () {
    Meteor.call('addFlag', flag);
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
