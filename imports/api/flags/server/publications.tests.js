import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { Flags } from '../Flags.js'
import { Factory } from 'meteor/dburles:factory';
import { fakerSchema } from '../../../utils/test-utils/faker-schema/';
import './publications.js';

describe('Flag publications', function () {
  /*
  Factory.define('user', Meteor.users, schema.User);
  creatorId = Factory.create('user')._id;
  flaggerId = Factory.create('user')._id;
  proposal = Factory.create('proposal', generateDoc(schema.Proposal));

  flag = {
    contentType: 'proposal',
    contentId: proposal._id,
    creatorId: creatorId,
    flaggerId: flaggerId,
    category: 'sexist',
    justification: 'I dont like it',
    status: 'pending',
    outcome: 'rejected',
    communityId: creatorId,
    other: ''
  }
  console.log(flag);
  beforeEach(function () {
    //Meteor.call('addFlag', flag);
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
  */
});
