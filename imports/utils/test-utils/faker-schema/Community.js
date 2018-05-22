import jsf from 'json-schema-faker';

export const CommunitySettings = {
  type: 'object',
  properties: {
  }
};

export const Community = {
  type: 'object',
  properties: {
    name: {
      faker: 'company.companyName'
    },
    subdomain: {
      faker: 'company.companyName'
    },
    createdAt: {
      faker: 'date.past'
    },
    settings: {
      type: CommunitySettings
    },
    languageSelector:{
      type: 'boolean'
    },
    defaultLanguage: {
      enum: ['en', 'sv']
    },
    languages: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    enforceWhitelist:{
      type: 'boolean'
    },
  },
  required: [
  'name',
  'subdomain',
  'settings',
  'createdAt'
  ]
};
