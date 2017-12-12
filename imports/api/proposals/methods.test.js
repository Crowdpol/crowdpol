import { Meteor } from 'meteor/meteor';
import { assert, expect } from 'meteor/practicalmeteor:chai';
import './methods.js';
import { Factory } from 'meteor/dburles:factory';
import { fakerSchema } from '../../utils/test-utils/faker-schema/';

const { schema, generateDoc } = fakerSchema;

if (Meteor.isServer) {

  describe('Proposal methods', () => {

    beforeEach(function () {
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
        Meteor.call('deleteProposal', proposalId);
        var proposal = Meteor.call('getProposal', proposalId);
        expect(proposal).to.not.exist;
        done();
      } catch (err) {
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

  });
}