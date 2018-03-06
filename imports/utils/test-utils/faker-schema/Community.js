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
    }
  },
  required: [
  'name',
  'subdomain',
  'settings',
  'createdAt'
  ]
};
