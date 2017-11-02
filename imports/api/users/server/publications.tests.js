// Tests for the links publications
//
// https://guide.meteor.com/testing.html
import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import './publications.js';


describe('users publications', function () {
  beforeEach(function () {
    Meteor.users.remove({});
    Accounts.createUser({
      email: 'test@test.test', 
      password: 'test'
    });
  });

  describe('users.all', function () {
    it('sends all users', function (done) {
      const collector = new PublicationCollector();
      collector.collect('users.all', (collections) => {
        assert.equal(collections.users.length, 1);
        done();
      });
    });
  });
});
