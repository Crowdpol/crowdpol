import jsf from 'json-schema-faker';

export const CommunitySettings = {
  type: 'object',
  properties: {
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
  }
  ,
  required: [
  'languageSelector',
  'defaultLanguage',
  'languages',
  'enforceWhitelist'
  ]
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
      type: 'object',
      properties: {
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
      }
      ,
      required: [
      'languageSelector',
      'defaultLanguage',
      'languages',
      'enforceWhitelist'
      ]
    }
    
  },
  required: [
  'name',
  'subdomain',
  'settings',
  'createdAt'
  ]
};
