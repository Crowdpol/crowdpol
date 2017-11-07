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
    it("Update proposal status", (done) => {
      try {
        Meteor.call('updateProposalStatus', testProposal, 'approved');
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });
    it("Update proposal stage", (done) => {
      try {
        Meteor.call('updateProposalStage', testProposal, 'live');
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

  });
}