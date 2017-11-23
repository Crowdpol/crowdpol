import { Meteor } from 'meteor/meteor';
import { assert, expect } from 'meteor/practicalmeteor:chai';
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
  
  describe('Vote methods', () => {
    beforeEach(function () {
        // create a fake proposal
        const proposal = Factory.create('proposal', generateDoc(schema.Proposal));
        // create a fake user
        Factory.define('user', Meteor.users, generateDoc(schema.User));
        const userId = Factory.create('user')._id
        // stub Meteor's user method to simulate a logged in user
        Roles.addUsersToRoles(userId, 'delegate');
        const user = Meteor.call('getUser', userId);
        stub = sinon.stub(Meteor, 'user');
        stub.returns(user)
        voteId = Meteor.call('vote', {vote: 'yes', proposalId: proposal._id});
      });

    afterEach(function () {
      // restores Meteor's user method
      sinon.restore(Meteor, 'user');
    });

    it("Lets user vote", (done) => {
      try {
        // create a fake proposal
        expect(voteId).to.exist;
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Get vote", (done) => {
      try {
        var vote = Meteor.call('getVote', voteId);
        expect(vote).to.exist;
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Gets a user's vote for specific proposal", (done) => {
      try {
        var vote = Meteor.call('getVote', voteId);
        var voteFor = Meteor.call('getUserVoteFor', vote.proposalId, vote.voterHash);
        expect(voteFor).to.exist;
        expect(voteFor.vote).to.equal('yes');
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Delete vote", (done) => {
      try {
        Meteor.call('deleteVote', voteId);
        var vote = Meteor.call('getVote', voteId);
        expect(vote).to.not.exist;
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });
  });
}