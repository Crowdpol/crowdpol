import { Meteor } from 'meteor/meteor';
import { assert, expect } from 'meteor/practicalmeteor:chai';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Factory } from 'meteor/dburles:factory';
import { fakerSchema } from '../../utils/test-utils/faker-schema/';
import '../../utils/test-utils/faker-schema/index.js';
import { sinon } from 'meteor/practicalmeteor:sinon';
import './methods.js';
import { Notifications } from './Notifications.js'

const { schema, generateDoc } = fakerSchema;

if (Meteor.isServer) {

  describe('Notification methods', () => {

    beforeEach(()=>{
        // create a fake user
        Factory.define('user', Meteor.users, schema.User);
        const userId = Factory.create('user')._id
        const user = Meteor.call('getUser', userId);
        // stub Meteor's user method to simulate a logged in user
        stub = sinon.stub(Meteor, 'user');
        stub.returns(user);
        notificationId = Meteor.call('createNotification', {message: 'new notif', url: 'url', userId: userId});
      });

    afterEach(()=>{
      sinon.restore(Meteor, 'user');
    });
    
    it("Creates a notification", (done) => {
      try {
        expect(notificationId).to.exist;
        var notification = Notifications.findOne(notificationId);
        expect(notification).to.exist;
        expect(notification.read).to.equal(false);
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Get notification", (done) => {
      try {
        var notification = Meteor.call('getNotification', notificationId);
        expect(notification).to.exist;
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Delete notification", (done) => {
      try {
        Meteor.call('deleteNotification', notificationId);
        var notification = Meteor.call('getNotification', notificationId);
        expect(notification).to.not.exist;
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

    it("Marks a message as read", (done) => {
      try {
        var notification = Meteor.call('getNotification', notificationId);
        expect(notification.read).to.equal(false);
        //console.log(Notifications.find().fetch())
        Meteor.call('readNotification', notificationId);
        notification = Meteor.call('getNotification', notificationId);
        //console.log(Notifications.find().fetch())
        expect(notification.read).to.equal(true);
        done();
      } catch (err) {
        console.log(err);
        assert.fail();
      }
    });

  });
}