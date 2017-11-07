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
        let title = 'Test Proposal'
        let abstract = 'This proposal will test the proposals'
        let body = 'I hereby propose a proposal to test the proposals so that others, too, may propose proposals.'
        let startDate = new Date()
        let endDate = new Date()
        let authorId = '213924230'
        testProposal = Meteor.call('createProposal', title, abstract, body, startDate, endDate, authorId);
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