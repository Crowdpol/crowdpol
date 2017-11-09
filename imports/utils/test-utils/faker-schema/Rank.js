import jsf from 'json-schema-faker';

export const Rank = {
  type: 'object',
  properties: {
    entityType: {
      enum: ['delegate','candidate'],
    },
    entityId: {
      type: 'string',
    },
    supporterId: {
      faker: 'date.past'
    },
    ranking: {
      type: 'number'
    }
  },
  required: [
    'type',
    'entityId',
    'supporterId',
    'ranking',
  ]
};
