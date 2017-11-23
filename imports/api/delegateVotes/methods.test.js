import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Factory } from 'meteor/dburles:factory';
import { fakerSchema } from '../../utils/test-utils/faker-schema/';
import { sinon } from 'meteor/practicalmeteor:sinon';
import { Proposals } from '../proposals/Proposals.js';
import { Users } from '../users/Users.js';
import './methods.js';
import '../proposals/methods.js';

const { schema, generateDoc } = fakerSchema;
Factory.define('user', Users)

if (Meteor.isServer) {
  let testVote;
  
  describe('DelegateVote methods', () => {
    beforeEach(function () {
    // create a fake user
    Factory.define('user', Meteor.users, schema.User);
    const userId = Factory.create('user')._id
    // stub Meteor's user method to simulate a logged in user
    Roles.addUsersToRoles(userId, 'delegate');
    const user = Meteor.call('getUser', userId);
    sinon.restore(Meteor, 'user');
    stub = sinon.stub(Meteor, 'user');
    stub.returns(user)
  });
    afterEach(function () {
    // restores Meteor's user method
    sinon.restore(Meteor, 'user');
  });

    it("Lets delegate vote", (done) => {
      try {
        // create a fake proposal
        const proposal = Factory.create('proposal', generateDoc(schema.Proposal));

        testVote = Meteor.call('voteAsDelegate', {vote: 'yes', proposalId: proposal._id});
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Get vote", (done) => {
      try {
        Meteor.call('getDelegateVote', testVote._id);
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Gets vote of specific delegate for specific proposal", (done) => {
      try {
        Meteor.call('getDelegateVote', testVote.proposalId, testVote.delegateId);
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Delete vote", (done) => {
      try {
        Meteor.call('deleteDelegateVote', testVote);
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });
  });
}