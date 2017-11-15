import jsf from 'json-schema-faker';

export const Proposal = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
    },
    abstract: {
      type: 'string',
    },
    body: {
      type: 'string',
    },
    startDate: {
      faker: 'date.past'
    },
    endDate: {
      faker: 'date.future'
    },
    createdAt: {
      faker: 'date.past'
    },
    stage: {
      type: {
        enum: ['draft', 'submitted', 'live']
      }
    },
    status: {
      type: {
        enum: ['new', 'pending', 'approved', 'rejected']
      }
    },
    authorId: {
      type: 'string'
    }
  },
  required: [
    'title',
    'abstract',
    'body',
    'createdAt',
    'endDate',
    'startDate',
    'stage',
    'status',
    'authorId',
  ]
};
