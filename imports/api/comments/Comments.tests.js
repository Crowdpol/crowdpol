import { Meteor } from 'meteor/meteor';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Factory } from 'meteor/dburles:factory';
import { fakerSchema } from '../../utils/test-utils/faker-schema/';
import { Comments } from './Comments';

const { schema, generateDoc } = fakerSchema;

Factory.define('comment', Comments);

describe('Comment schema', function() {
  beforeEach(function() {
    resetDatabase();
  });

  it('inserts cleanly', function() {
    const testDoc = generateDoc(schema.Comment)
    const comment = Factory.create('comment', testDoc);
  });
});
