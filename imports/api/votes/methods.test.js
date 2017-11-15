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
  
  describe('Vote methods', () => {
    beforeEach(function () {
      var testUser = {
        createdAt: new Date(),
        username: "test_user",
        password: 'test',
        services: {},
        profile: {
          firstName: "Test",
          lastName: "User",
          birthday: new Date(),
          gender: "Other",
          organization: "Test Org",
          website: "http://testuser.com",
          bio: "I am a test user",
          picture: "/img/default-user-image.png",
          credentials : [
          {
            "source" : "test",
            "URL" : "https://www.commondemocracy.org/",
            "validated" : true
          }
          ]
        },
        roles: ["test"],
      }
    // stub Meteor's user method to simulate a logged in user
    const userId = Accounts.createUser(testUser);
    const user = Meteor.call('getUser', userId);
    stub = sinon.stub(Meteor, 'user');
    stub.returns(user)
  });
    afterEach(function () {
    // restores Meteor's user method
    sinon.restore(Meteor, 'user');
  });
    it("Lets user vote", (done) => {
      try {
        // create a fake proposal
        const proposal = Factory.create('proposal', generateDoc(schema.Proposal));

        testVote = Meteor.call('vote', {vote: 'yes', proposalId: proposal._id});
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Get vote", (done) => {
      try {
        Meteor.call('getVote', testVote);
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Delete vote", (done) => {
      try {
        Meteor.call('deleteVote', testVote);
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });
  });
}