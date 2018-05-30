// Tests for links methods
//
// https://guide.meteor.com/testing.html

import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { expect } from 'meteor/practicalmeteor:chai';
import './methods.js';
import { Factory } from 'meteor/dburles:factory';
import { fakerSchema } from '../../utils/test-utils/faker-schema/';
import { sinon } from 'meteor/practicalmeteor:sinon';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Communities } from './Communities.js'

const { schema, generateDoc } = fakerSchema;
/*
if (Meteor.isServer) {

  describe('Community Methods', () => {

    describe('Basic Community Methods', () => {

      it("Creates a new community", (done) => {
        try {
          test=generateDoc(schema.Community);
          var community = Factory.create('community', test);
          var id = Meteor.call('createCommunity', community);
          expect(Communities.find({_id: id}).count()).to.equal(1);
          done();
        } catch (err) {
          console.log(err);
          assert.fail();
        }
      });
    }); // End of basic method tests

  }) // End of community method tests
}
*/