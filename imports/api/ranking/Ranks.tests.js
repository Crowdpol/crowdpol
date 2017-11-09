import { Meteor } from 'meteor/meteor';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Factory } from 'meteor/dburles:factory';
import { fakerSchema } from '../../utils/test-utils/faker-schema/';
import { Ranks } from './Ranks';

const { schema, generateDoc } = fakerSchema;

Factory.define('rank', Ranks);

describe('Ranks schema', function() {
  beforeEach(function() {
    resetDatabase();
  });

  // sanity check that jsf schema validaes ok
  it('inserts cleanly', function() {
    const testDoc = generateDoc(schema.Rank)
    const rank = Factory.create('rank', testDoc);
  });
});
