import jsf from 'json-schema-faker';

export const Vote = {
  type: 'object',
  properties: {
    proposalId: {
      type: 'string',
    },
    vote: {
      type: {
        enum: ['yes', 'no']
      }
    },
    createdAt: {
      faker: 'date.past'
    },
    voterHash: {
      type: 'string'
    },
    delegateId: {
      type: 'string'
    }
  },
  required: [
    'proposalId',
    'vote',
    'createdAt',
    'voterHash',
  ]
};
