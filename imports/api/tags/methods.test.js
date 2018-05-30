import { Meteor } from 'meteor/meteor';
import { assert, expect } from 'meteor/practicalmeteor:chai';
import { Factory } from 'meteor/dburles:factory';
import { fakerSchema } from '../../utils/test-utils/faker-schema/';
import './methods.js';

const { schema, generateDoc } = fakerSchema;

if (Meteor.isServer) {
  describe('Tag methods', () => {

    beforeEach(()=>{
      // Create a fake tag
      tag = Factory.create('tag', generateDoc(schema.Tag));
      community = Factory.create('community', generateDoc(schema.Community));
    });

    it("Add tag", (done) => {
      try {
        var id = Meteor.call('addTag', "testing",community._id);
        expect(id).to.exist;
        var testTag = Meteor.call('getTag', id);
        expect(testTag).to.exist;
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Get tag", (done) => {
      try {
        var testTag = Meteor.call('getTag', tag._id);
        expect(testTag).to.exist;
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Delete tag", (done) => {
      try {
        Meteor.call('deleteTag', tag._id);
        var testTag = Meteor.call('getTag', tag._id);
        expect(testTag).to.not.exist;
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });
    
    it("Toggle tag authorized", (done) => {
      try {
        Meteor.call('toggleAuthorized', tag._id, false);
        tag = Meteor.call('getTag', tag._id);
        expect(tag.authorized).to.equal(false);
        Meteor.call('toggleAuthorized', tag._id, true);
        tag = Meteor.call('getTag', tag._id);
        expect(tag.authorized).to.equal(true);
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Tranform tags", (done) => {
      try {
        var tagArray = Meteor.call('transformTags', ['TagOne'], true);
        expect(tagArray[0].keyword).to.equal('tagone');
        expect(tagArray[0].url).to.equal('/tag/tagone');
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });


  });
}