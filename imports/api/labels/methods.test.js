/* disabled until Labels are re-introduced into the functional line-up
import { Meteor } from 'meteor/meteor';
import { assert, expect } from 'meteor/practicalmeteor:chai';
import { Factory } from 'meteor/dburles:factory';
import { fakerSchema } from '../../utils/test-utils/faker-schema/';
import './methods.js';

const { schema, generateDoc } = fakerSchema;

if (Meteor.isServer) {
  describe('Label methods', () => {

    beforeEach(()=>{
      // Create a fake label
      label = Factory.create('label', generateDoc(schema.Label));
      community = Factory.create('community', generateDoc(schema.Community));
      communityId = community._id;
    });

    it("Add label", (done) => {
      try {
        var id = Meteor.call('addLabel', "testing",communityId);
        expect(id).to.exist;
        var testLabel = Meteor.call('getLabel', id);
        expect(testLabel).to.exist;
        done();
      } catch (err) {
        assert.fail();
      }
    });

    it("Get label", (done) => {
      try {
        var testLabel = Meteor.call('getLabel', label._id);
        expect(testLabel).to.exist;
        done();
      } catch (err) {
        assert.fail();
      }
    });

    it("Delete label", (done) => {
      try {
        Meteor.call('deleteLabel', label._id);
        var testLabel = Meteor.call('getLabel', label._id);
        expect(testLabel).to.not.exist;
        done();
      } catch (err) {
        assert.fail();
      }
    });

    it("Toggle label authorized", (done) => {
      try {
        Meteor.call('toggleAuthorized', label._id, false);
        label = Meteor.call('getLabel', label._id);
        expect(label.authorized).to.equal(false);
        Meteor.call('toggleAuthorized', label._id, true);
        label = Meteor.call('getLabel', label._id);
        expect(label.authorized).to.equal(true);
        done();
      } catch (err) {
        assert.fail();
      }
    });

    it("Tranform labels", (done) => {
      try {
        var labelArray = Meteor.call('transformLabels', ['LabelOne'], community._id);
        expect(labelArray[0].keyword).to.equal('labelone');
        expect(labelArray[0].url).to.equal('/label/labelone');
        done();
      } catch (err) {
        assert.fail();
      }
    });


  });
}
*/
