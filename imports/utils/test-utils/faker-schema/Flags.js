import jsf from 'json-schema-faker';

export const Flags = {
  type: 'object',
  properties: {
    contentType: {
      enum: ["proposal", "comment", "profile"]
    },
    contentId: {
      type: 'string'
    },
    creatorId: {
      type: 'string'
    },
    flaggerId: {
      type: 'string'
    },
    category: {
      enum: ["sexist", "racist", "langauge","other"]
    },
    other: {
      type: 'string'
    },
    justification: {
      type: 'string'
    },
    createdAt: {
      faker: 'date.past'
    },
    lastUpdate: {
      faker: 'date.past'
    },
    status: {
      enum: ["pending", "reviewed"]
    },
    outcome: {
      enum: ["rejected", "blocked"]
    },
    communityId: {
      type: 'string'
    }
  },
  required: [
    'contentType',
    'contentId',
    'creatorId',
    'flaggerId',
    'category',
    'other',
    'justification',
    'createdAt',
    'lastUpdate',
    'status',
    'outcome',
    'communityId',
  ]
};
