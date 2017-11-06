import { Meteor } from 'meteor/meteor';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Factory } from 'meteor/dburles:factory';
import { fakerSchema } from '../../utils/test-utils/faker-schema/';
import { Proposals } from './Proposals';

const { schema, generateDoc } = fakerSchema;

Factory.define('proposal', Proposals);

describe('Proposal schema', function() {
  beforeEach(function() {
    resetDatabase();
  });

  it('inserts cleanly', function() {
    const testDoc = generateDoc(schema.Proposal)
    console.log(testDoc)
    const proposal = Factory.create('proposal', testDoc);
  });
});
