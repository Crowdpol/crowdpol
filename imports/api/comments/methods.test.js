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
  let testComment;
  beforeEach(function () {

  });
  describe('Comment methods', () => {
    it("Lets user comment", (done) => {
      try {
        // create a fake proposal
        const proposal = Factory.create('proposal', generateDoc(schema.Proposal));
        // create a fake user
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
        const userId = Accounts.createUser(testUser);
        const user = Meteor.call('getUser', userId);
        // stub Meteor's user method to simulate a logged in user
        stub = sinon.stub(Meteor, 'user');
        stub.returns(user)

        testComment = Meteor.call('comment', {message: 'test comment', proposalId: proposal._id});
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Get comment", (done) => {
      try {
        Meteor.call('getComment', testComment);
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Delete comment", (done) => {
      try {
        Meteor.call('deleteProposal', testComment);
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });
  });
}