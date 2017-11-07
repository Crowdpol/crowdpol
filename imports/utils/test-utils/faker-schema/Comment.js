import jsf from 'json-schema-faker';

export const Comment = {
  type: 'object',
  properties: {
    proposalId: {
      type: 'string',
    },
    message: {
      type: 'string',
    },
    createdAt: {
      faker: 'date.past'
    },
    authorId: {
      type: 'string'
    }
  },
  required: [
    'proposalId',
    'message',
    'createdAt',
    'authorId',
  ]
};
