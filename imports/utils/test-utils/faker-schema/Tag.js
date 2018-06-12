import jsf from 'json-schema-faker';

export const Tag = {
  type: 'object',
  properties: {
    keyword: {
      faker: {
        'helpers.slugify': [jsf({ faker: 'hacker.phrase' })],
      },
    },
    url: {
      faker: 'internet.url'
    },
    authors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: {
            type: 'string'
          }
        },
        required: ['_id']
      }
    },
    createdAt: {
      faker: 'date.past'
    },
    lastUpdate: {
      faker: 'date.past'
    },
    authorized: {
      type: 'boolean'
    },
    communityId: {
      type: 'string'
    }
  },
  required: [
    'text',
    'keyword',
    'url',
    'createdAt',
    'lastUpdate',
    'authorized',
    'communityId'
  ]
};
