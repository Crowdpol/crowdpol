import { Meteor } from 'meteor/meteor';
import { assert, expect } from 'meteor/practicalmeteor:chai';
import './methods.js';
import { Factory } from 'meteor/dburles:factory';
import { fakerSchema } from '../../utils/test-utils/faker-schema/';
import { Ranks } from '../ranking/Ranks.js'
import { Votes } from '../votes/Votes.js'
import { DelegateVotes } from '../delegateVotes/DelegateVotes.js'
import { Proposals } from './Proposals.js'
import { resetDatabase } from 'meteor/xolvio:cleaner';

const { schema, generateDoc } = fakerSchema;

if (Meteor.isServer) {

  describe('Proposal methods', () => {

    beforeEach(function () {
      resetDatabase(null);
      proposalId = Factory.create('proposal', generateDoc(schema.Proposal))._id;
    });

    it("Create proposal", (done) => {
      try {
        var proposalData = {
          title: 'Test Proposal',
          abstract: 'This proposal will test the proposals',
          body: 'I hereby propose a proposal to test the proposals so that others, too, may propose proposals.',
          startDate: new Date(),
          endDate: new Date(),
          authorId: '213924230',
          pointsFor: ['point1','point2'],
          pointsAgainst: ['point1','point2'],
          references: ['ref1','ref2'],
        }
        
        id = Meteor.call('createProposal', proposalData);
        expect(id).to.exist;
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Get proposal", (done) => {
      try {
        var proposal = Meteor.call('getProposal', proposalId);
        expect(proposal).to.exist;
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Delete proposal", (done) => {
      try {
        // create a fake user
        Factory.define('user', Meteor.users, schema.User);
        const userId = Factory.create('user')._id
        const user = Meteor.call('getUser', userId);
        // create a proposal belonging to the author
        var proposalData = {
          title: 'Test Proposal',
          abstract: 'This proposal will test the proposals',
          body: 'I hereby propose a proposal to test the proposals so that others, too, may propose proposals.',
          startDate: new Date(),
          endDate: new Date(),
          authorId: userId,
          pointsFor: ['point1','point2'],
          pointsAgainst: ['point1','point2'],
          references: ['ref1','ref2'],
        }
        
        var deletableProposalId = Meteor.call('createProposal', proposalData);
        // stub Meteor's user method to simulate a logged in user
        stub = sinon.stub(Meteor, 'user');
        stub.returns(user);

        Meteor.call('deleteProposal', deletableProposalId);
        var proposal = Meteor.call('getProposal', deletableProposalId);
        expect(proposal).to.not.exist;
        done();
        sinon.restore(Meteor, 'user');
      } catch (err) {
        sinon.restore(Meteor, 'user');
        console.log(err);
        assert.fail();
      }
    });

    it("Approve proposal", (done) => {
      try {
        Meteor.call('approveProposal', proposalId);
        var proposal = Meteor.call('getProposal', proposalId);
        expect(proposal.stage).to.equal('live');
        expect(proposal.status).to.equal('approved');
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Reject proposal", (done) => {
      try {
        Meteor.call('rejectProposal', proposalId);
        var proposal = Meteor.call('getProposal', proposalId);
        expect(proposal.status).to.equal('rejected');
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

     it("Save proposal changes", (done) => {
      try {
        Meteor.call('saveProposalChanges', proposalId, {body: 'new body'});
        var proposal = Meteor.call('getProposal', proposalId);
        expect(proposal.body).to.equal('new body');
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Add tag to proposal", (done) => {
      try {
        Meteor.call('addTagToProposal', proposalId, {keyword: 'keyword', url: 'tags/keyword', _id: '123'});
        var proposal = Meteor.call('getProposal', proposalId);
        expect(proposal.tags).to.have.lengthOf(1);
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Remove tag from proposal", (done) => {
      try {
        var tag = {keyword: 'keyword', url: 'tags/keyword', _id: '123'}
        Meteor.call('addTagToProposal', proposalId, tag);
        Meteor.call('removeTagFromProposal', proposalId, tag);
        var proposal = Meteor.call('getProposal', proposalId);
        expect(proposal.tags).to.have.lengthOf(0);
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    describe("Prepares Votes for Tally", () => {

      beforeEach(function(){
        resetDatabase(null);
        // Create an expired proposal
        proposalToTallyId = Proposals.insert({
          title: 'title', 
          abstract: 'abstract', 
          body: 'body',
          startDate: moment().subtract(3, 'days').toDate(),
          endDate: moment().subtract(1, 'days').toDate(),
          stage: 'live',
          status: 'approved',
          authorId: '123'
        });
        // Create 16 users
        Factory.define('user', Meteor.users, schema.User);
        allUsers = []

        for (i=0; i<16; i++){
          var user = Factory.create('user')._id
          allUsers.push(user);
        }

        // Create 8 individuals
        voters = []
        for (i=0; i<8; i++){
          var user = allUsers[i];
          Roles.addUsersToRoles(user, 'individual')
          voters.push(user);  
        }

        // Create 8 delegates
        delegates = []
        for (i=8; i<16; i++){
          var user = allUsers[i];
          Roles.addUsersToRoles(user, 'delegate')
          delegates.push(user);
        }

        // Assign delegates to voters
        // voter 0 has delegates 0,1,2,3,4
        Ranks.insert({entityType: 'delegate', entityId: delegates[0], supporterId: voters[0], ranking: 1})
        Ranks.insert({entityType: 'delegate', entityId: delegates[1], supporterId: voters[0], ranking: 2})
        Ranks.insert({entityType: 'delegate', entityId: delegates[2], supporterId: voters[0], ranking: 3})
        Ranks.insert({entityType: 'delegate', entityId: delegates[3], supporterId: voters[0], ranking: 4})
        Ranks.insert({entityType: 'delegate', entityId: delegates[4], supporterId: voters[0], ranking: 5})

        //voter 1 has delegates 5,3,7,0,4
        Ranks.insert({entityType: 'delegate', entityId: delegates[5], supporterId: voters[1], ranking: 1})
        Ranks.insert({entityType: 'delegate', entityId: delegates[3], supporterId: voters[1], ranking: 2})
        Ranks.insert({entityType: 'delegate', entityId: delegates[7], supporterId: voters[1], ranking: 3})
        Ranks.insert({entityType: 'delegate', entityId: delegates[0], supporterId: voters[1], ranking: 4})
        Ranks.insert({entityType: 'delegate', entityId: delegates[4], supporterId: voters[1], ranking: 5})

        //voter 2 has no delegates

        //voter 3 has delegate 4
        Ranks.insert({entityType: 'delegate', entityId: delegates[4], supporterId: voters[3], ranking: 1})

        //voter 4 has no delegates

        //voter 5 has delegates 4,5,6
        Ranks.insert({entityType: 'delegate', entityId: delegates[4], supporterId: voters[5], ranking: 1})
        Ranks.insert({entityType: 'delegate', entityId: delegates[5], supporterId: voters[5], ranking: 2})
        Ranks.insert({entityType: 'delegate', entityId: delegates[6], supporterId: voters[5], ranking: 3})

        //voter 6 has delegates 1,3,5,7,0
        Ranks.insert({entityType: 'delegate', entityId: delegates[1], supporterId: voters[6], ranking: 1})
        Ranks.insert({entityType: 'delegate', entityId: delegates[3], supporterId: voters[6], ranking: 2})
        Ranks.insert({entityType: 'delegate', entityId: delegates[5], supporterId: voters[6], ranking: 3})
        Ranks.insert({entityType: 'delegate', entityId: delegates[7], supporterId: voters[6], ranking: 4})
        Ranks.insert({entityType: 'delegate', entityId: delegates[0], supporterId: voters[6], ranking: 5})

        //voter 7 has delegate 7
        Ranks.insert({entityType: 'delegate', entityId: delegates[7], supporterId: voters[7]  , ranking: 1})
        
        // Create user votes
        // voters 0, 1, 2 voted yes
        Votes.insert({proposalId: proposalToTallyId, vote: 'yes', voterHash: voters[0]})
        Votes.insert({proposalId: proposalToTallyId, vote: 'yes', voterHash: voters[1]})
        Votes.insert({proposalId: proposalToTallyId, vote: 'yes', voterHash: voters[2]})

        // voter 3 voted no
        Votes.insert({proposalId: proposalToTallyId, vote: 'no', voterHash: voters[3]})

        // voters 4,5,6,7 did not vote

        // Create delegate votes
        // delegates 0, 1, 2 did not vote
        // delegates 3, 4 voted yes
        DelegateVotes.insert({proposalId: proposalToTallyId, vote: 'yes', delegateId: delegates[3]})
        DelegateVotes.insert({proposalId: proposalToTallyId, vote: 'yes', delegateId: delegates[4]})
        // delegates 5, 6, 7 voted no 
        DelegateVotes.insert({proposalId: proposalToTallyId, vote: 'no', delegateId: delegates[5]})
        DelegateVotes.insert({proposalId: proposalToTallyId, vote: 'no', delegateId: delegates[6]})
        DelegateVotes.insert({proposalId: proposalToTallyId, vote: 'no', delegateId: delegates[7]})
      });

      // Normal Case
      it("Can create votes when users delegated votes", (done) => {
        try {
          Meteor.call('prepareVotesForTally', [proposalToTallyId]);
          expect(Votes.find({vote: 'yes', proposalId: proposalToTallyId}).count()).to.equal(5);
          expect(Votes.find({vote: 'no', proposalId: proposalToTallyId}).count()).to.equal(2);
          expect(Proposals.findOne({_id: proposalToTallyId}).readyToTally).to.equal(true);
          done();
        } catch (err) {
          console.log(err);
          assert.fail();
        }
      });

      // No one voted
      it("Does not break if no one voted", (done) => {
        try {
          unvotedProposalId = Proposals.insert({
            title: 'title', 
            abstract: 'abstract', 
            body: 'this proposal has not yet been voted on',
            startDate: moment().subtract(3, 'days').toDate(),
            endDate: moment().subtract(1, 'days').toDate(),
            stage: 'live',
            status: 'approved',
            authorId: '1234'
          });
          Meteor.call('prepareVotesForTally', [unvotedProposalId]);
          expect(Votes.find({vote: 'yes', proposalId: unvotedProposalId}).count()).to.equal(0);
          expect(Votes.find({vote: 'no', proposalId: unvotedProposalId}).count()).to.equal(0);
          done();
        } catch (err) {
          console.log(err);
          assert.fail();
        }
      });

      // Multiple expired proposals?

    });

  });
}