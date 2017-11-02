// https://guide.meteor.com/testing.html
import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import './publications.js';


describe('User publications', function () {
  beforeEach(function () {
    Meteor.users.remove({});
    Accounts.createUser({
      email: 'test@test.test', 
      password: 'test'
    });
  });

  describe('users', function () {
    it('sends all users without services', function (done) {
      const collector = new PublicationCollector();
      collector.collect('users', (collections) => {
        assert.equal(collections.users.length, 1);
        done();
      });
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
