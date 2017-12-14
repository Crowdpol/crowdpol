import { Meteor } from 'meteor/meteor';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Factory } from 'meteor/dburles:factory';
import { fakerSchema } from '../../utils/test-utils/faker-schema/';
import { Notifications } from './Notifications';

const { schema, generateDoc } = fakerSchema;

Factory.define('notification', Notifications);

describe('Notifcation schema', function() {
  beforeEach(function() {
    resetDatabase();
  });

  it('inserts cleanly', function() {
    const testDoc = generateDoc(schema.Notification)
    const notifcation = Factory.create('notification', testDoc);
  });
});
