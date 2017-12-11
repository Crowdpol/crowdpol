import { Meteor } from 'meteor/meteor';
import { assert, expect } from 'meteor/practicalmeteor:chai';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Factory } from 'meteor/dburles:factory';
import { fakerSchema } from '../../utils/test-utils/faker-schema/';
import '../../utils/test-utils/faker-schema/index.js';
import { sinon } from 'meteor/practicalmeteor:sinon';
import { Proposals } from '../proposals/Proposals.js';
import './methods.js';
import '../proposals/methods.js';

const { schema, generateDoc } = fakerSchema;

if (Meteor.isServer) {

  let testCommentId;

  describe('Comment methods', () => {

    beforeEach(()=>{
      // create a fake proposal
        const proposal = Factory.create('proposal', generateDoc(schema.Proposal));
        // create a fake user
        Factory.define('user', Meteor.users, schema.User);
        const userId = Factory.create('user')._id
        const user = Meteor.call('getUser', userId);
        // stub Meteor's user method to simulate a logged in user
        stub = sinon.stub(Meteor, 'user');
        stub.returns(user)
        testCommentId = Meteor.call('comment', {message: 'test comment', proposalId: proposal._id});
      });

    afterEach(()=>{
      sinon.restore(Meteor, 'user');
    });
    
    it("Lets user comment", (done) => {
      try {
        expect(testCommentId).to.exist;
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Get comment", (done) => {
      try {
        console.log(testCommentId)
        var testComment = Meteor.call('getComment', testCommentId);
        expect(testComment).to.exist;
        expect(testComment.message).to.equal('test comment');
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Delete comment", (done) => {
      try {
        Meteor.call('deleteComment', testCommentId);
        var testComment = Meteor.call('getComment', testCommentId);
        expect(testComment).to.not.exist;
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });
  });
}