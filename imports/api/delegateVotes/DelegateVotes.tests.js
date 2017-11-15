import { Meteor } from 'meteor/meteor';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Factory } from 'meteor/dburles:factory';
import { fakerSchema } from '../../utils/test-utils/faker-schema/';
import { DelegateVotes } from './DelegateVotes';

const { schema, generateDoc } = fakerSchema;

Factory.define('delegateVote', DelegateVotes);

describe('DelegateVotes schema', function() {
  beforeEach(function() {
    resetDatabase();
  });

  it('inserts cleanly', function() {
    const testDoc = generateDoc(schema.DelegateVote)
    const vote = Factory.create('delegateVote', testDoc);
  });
});
