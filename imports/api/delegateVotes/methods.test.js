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

if (Meteor.isServer) {
  let testVote;
  
  describe('DelegateVote methods', () => {
    beforeEach(function () {
      // create a fake proposal
      var endDate = moment().add(3, 'weeks').toDate();
      var proposal = Factory.create('proposal', generateDoc(schema.Proposal));
      Proposals.update({_id: proposal._id}, {$set: {endDate: endDate}});
      proposal = Proposals.findOne(proposal._id);
      // create a fake user
      Factory.define('user', Meteor.users, generateDoc(schema.User));
      const fakeUser = Factory.create('user');
      console.log(fakeUser);
      userId = fakeUser._id;
      // stub Meteor's user method to simulate a logged in user
      Roles.addUsersToRoles(userId, 'delegate');
      const user = Meteor.call('getUser', userId);
      stub = sinon.stub(Meteor, 'user');
      stub.returns(user);
      idStub = sinon.stub(Meteor, 'userId');
      idStub.returns(user._id); 
      testVoteId = Meteor.call('voteAsDelegate', {vote: 'yes', proposalId: proposal._id, reason: ''});
    });
    afterEach(function () {
      // restores Meteor's user method
      sinon.restore(Meteor, 'user');
    });

    it("Lets delegate vote", (done) => {
      try {
        expect(testVoteId).to.exist;
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Closes the delegate vote two weeks before the proposal expires", (done) => {
        try {
        var endDate = moment().add(1, 'weeks').toDate();
        var closedProposal = Factory.create('proposal', generateDoc(schema.Proposal));
        Proposals.update({_id: closedProposal._id}, {$set: {endDate: endDate}});
        closedProposal = Proposals.findOne(closedProposal._id);
        assert.throws(() => {
          Meteor.call('voteAsDelegate', {vote: 'yes', proposalId: closedProposal._id, reason: ''});
        }, Meteor.Error, 422);
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Get vote", (done) => {
      try {
        var vote = Meteor.call('getDelegateVote', testVoteId);
        expect(vote).to.exist;
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Gets vote of specific delegate for specific proposal", (done) => {
      try {
        var vote = Meteor.call('getDelegateVote', testVoteId);
        var voteFor = Meteor.call('getDelegateVoteFor', vote.proposalId, vote.delegateId);
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
        Meteor.call('deleteDelegateVote', testVoteId);
        var vote = Meteor.call('getDelegateVote', testVoteId);
        expect(vote).to.not.exist;
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });
  });
}