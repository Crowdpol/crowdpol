import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { Notifications } from '../Notifications.js'
import { fakerSchema } from '../../../utils/test-utils/faker-schema/';
import './publications.js';
import { resetDatabase } from 'meteor/xolvio:cleaner';

const { schema, generateDoc } = fakerSchema;

describe('Notifications publications', function () {
  beforeEach(function () {
    Notifications.insert({message: 'Test notification 1', userId: '123', url: '/notification'});
    Notifications.insert({message: 'Test notification 2', userId: '123', url: '/notification'});
    Notifications.insert({message: 'Test notification 3', userId: '123', url: '/notification'});
    Notifications.insert({message: 'Test notification 4', userId: '111', url: '/notification'});
  });

  describe('notifications', function () {

    it('publishes notification for a user', function (done) {
      const collector = new PublicationCollector();
      collector.collect('notifications.forUser', '123', (collections) => {
        assert.equal(collections.notifications.length, 3);
        done();
      });
    });
  });
});
