import jsf from 'json-schema-faker';

export const DelegateVote = {
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
    delegateId: {
      type: 'string'
    }
  },
  required: [
    'proposalId',
    'vote',
    'createdAt',
    'delegateId'
  ]
};
