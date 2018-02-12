import jsf from 'json-schema-faker';

export const Notification = {
  type: 'object',
  properties: {
    userId: {
      type: 'string',
    },
    message: {
      type: 'string',
    },
    url: {
      type: 'string',
    },
    read: {
      type: false,
    }
  },
  required: [
    'userId',
    'url',
    'message',
    'read',
  ]
};
