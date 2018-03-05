import { Meteor } from 'meteor/meteor';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Factory } from 'meteor/dburles:factory';
import { fakerSchema } from '../../utils/test-utils/faker-schema/';
import { Communities } from './Communities';

const { schema, generateDoc } = fakerSchema;

Factory.define('community', Communities);

describe('Community schema', function() {
  beforeEach(function() {
    resetDatabase();
  });

  it('inserts cleanly', function() {
    const testDoc = generateDoc(schema.Community)
    const community = Factory.create('community', testDoc);
  });
});
