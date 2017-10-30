// Tests for links methods
//
// https://guide.meteor.com/testing.html

import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import './methods.js';

if (Meteor.isServer) {
  describe('users methods', function () {
    beforeEach(function () {
      Users.remove({});
    });

    it('can add a new user', function () {
      const addUser= Meteor.server.method_handlers['addUser'];

      addLink.apply({}, ['meteor.com', 'https://www.meteor.com']);

      assert.equal(Links.find().count(), 1);
    });
  });
}