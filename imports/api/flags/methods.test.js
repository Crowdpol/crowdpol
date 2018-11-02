import { Meteor } from 'meteor/meteor';
import { assert, expect } from 'meteor/practicalmeteor:chai';
import { Factory } from 'meteor/dburles:factory';
import { fakerSchema } from '../../utils/test-utils/faker-schema/';
import './methods.js';

const { schema, generateDoc } = fakerSchema;

if (Meteor.isServer) {
  describe('Flag methods', () => {

    beforeEach(()=>{
      // Create a fake flag
      flag = Factory.create('flags', generateDoc(schema.Flags));
    });

    it("Add flag", (done) => {
      try {
        var id = Meteor.call('addFlag', flag);
        expect(id).to.exist;
        var testFlag = Meteor.call('getFlag', id);
        expect(testFlag).to.exist;
        done();
      } catch (err) {
        assert.fail();
      }
    });

    it("Get flag", (done) => {
      try {
        var testFlag = Meteor.call('getFlag', flag._id);
        expect(testFlag).to.exist;
        done();
      } catch (err) {
        assert.fail();
      }
    });

    it("Delete flag", (done) => {
      try {
        Meteor.call('deleteFlag', flag._id);
        var testFlag = Meteor.call('getFlag', flag._id);
        expect(testFlag).to.not.exist;
        done();
      } catch (err) {
        assert.fail();
      }
    });
  });
}
