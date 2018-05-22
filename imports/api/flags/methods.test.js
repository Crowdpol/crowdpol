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
      flag = Factory.create('flag', generateDoc(schema.Flag));
    });

    it("Add flag", (done) => {
      try {
        var id = Meteor.call('addFlag', "testing");
        expect(id).to.exist;
        var testFlag = Meteor.call('getFlag', id);
        expect(testFlag).to.exist;
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Get flag", (done) => {
      try {
        var testFlag = Meteor.call('getFlag', flag._id);
        expect(testFlag).to.exist;
        done();
      } catch (err) {
        console.log(err);
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
        console.log(err);
        assert.fail();
      }
    });
    
    it("Toggle flag authorized", (done) => {
      try {
        Meteor.call('toggleAuthorized', flag._id, false);
        flag = Meteor.call('getFlag', flag._id);
        expect(flag.authorized).to.equal(false);
        Meteor.call('toggleAuthorized', flag._id, true);
        flag = Meteor.call('getFlag', flag._id);
        expect(flag.authorized).to.equal(true);
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Tranform flags", (done) => {
      try {
        var flagArray = Meteor.call('transformFlags', ['FlagOne'], true);
        expect(flagArray[0].keyword).to.equal('flagone');
        expect(flagArray[0].url).to.equal('/flag/flagone');
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });


  });
}