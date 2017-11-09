import { Meteor } from 'meteor/meteor';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Factory } from 'meteor/dburles:factory';
import { fakerSchema } from '../../utils/test-utils/faker-schema/';
import { Votes } from './Votes';

const { schema, generateDoc } = fakerSchema;

Factory.define('vote', Votes);

describe('Vote schema', function() {
  beforeEach(function() {
    resetDatabase();
  });

  it('inserts cleanly', function() {
    const testDoc = generateDoc(schema.Vote)
    const vote = Factory.create('vote', testDoc);
  });
});
