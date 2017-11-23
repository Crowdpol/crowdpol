import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import './methods.js';

if (Meteor.isServer) {
  let testTag;
  beforeEach(function () {

  });
  describe('Tag methods', () => {
    it("Add tag", (done) => {
      try {
        testTag = Meteor.call('addTag', "testing");
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Get tag", (done) => {
      try {
        Meteor.call('getTag', testTag);
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Delete tag", (done) => {
      try {
        Meteor.call('deleteTag', testTag);
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });
    
    it("Toggle tag authorized", (done) => {
      try {
        Meteor.call('toggleAuthorized', testTag, true);
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Tranform tags", (done) => {
      try {
        Meteor.call('transformTags', ['TagOne', 'TagTwo'], true);
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });


  });
}