import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import './methods.js';

if (Meteor.isServer) {
  let testProposal;
  beforeEach(function () {

  });
  describe('Proposal methods', () => {
    it("Create proposal", (done) => {
      try {
        proposal = {
          title: 'Test Proposal',
          abstract: 'This proposal will test the proposals',
          body: 'I hereby propose a proposal to test the proposals so that others, too, may propose proposals.',
          startDate: new Date(),
          endDate: new Date(),
          authorId: '213924230'
        }
        
        testProposal = Meteor.call('createProposal', proposal);
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Get proposal", (done) => {
      try {
        Meteor.call('getProposal', testProposal);
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Delete proposal", (done) => {
      try {
        Meteor.call('deleteProposal', testProposal);
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Approve proposal", (done) => {
      try {
        Meteor.call('approveProposal', testProposal);
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Reject proposal", (done) => {
      try {
        Meteor.call('rejectProposal', testProposal, 'live');
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Update propsal stage", (done) => {
      try {
        Meteor.call('updateProposalStage', 'live');
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

     it("Save proposal changes", (done) => {
      try {
        Meteor.call('saveProposalChanges', {body: 'new body'});
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Add tag to proposal", (done) => {
      try {
        Meteor.call('addTagToProposal', {text: 'text', keyword: 'keyword', url: 'tags/keyword', _id: '123'});
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Remove tag from proposal", (done) => {
      try {
        Meteor.call('addTagToProposal', {text: 'text', keyword: 'keyword', url: 'tags/keyword', _id: '123'});
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

  });
}