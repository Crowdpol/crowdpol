import { Meteor } from 'meteor/meteor';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Factory } from 'meteor/dburles:factory';
import { fakerSchema } from '../../utils/test-utils/faker-schema/';
import { Labels } from './Labels';

const { schema, generateDoc } = fakerSchema;

Factory.define('label', Labels);

describe('Labels schema', function() {
  beforeEach(function() {
    resetDatabase();
  });

  // sanity check that jsf schema validaes ok
  it('inserts cleanly', function() {
    const testDoc = generateDoc(schema.Label)
    const label = Factory.create('label', testDoc);
  });
});
