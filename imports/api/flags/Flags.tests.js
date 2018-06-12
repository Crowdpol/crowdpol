import { Meteor } from 'meteor/meteor';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Factory } from 'meteor/dburles:factory';
import { fakerSchema } from '../../utils/test-utils/faker-schema/';
import { Flags } from './Flags';

const { schema, generateDoc } = fakerSchema;

Factory.define('flags', Flags);
/*
describe('Flags schema', function() {
  beforeEach(function() {
    resetDatabase();
  });

  // sanity check that jsf schema validates ok
  it('inserts cleanly', function() {
    const testDoc = generateDoc(schema.Flags)
    const flag = Factory.create('flag', testDoc);
  });
});
*/