import jsf from 'json-schema-faker';

export const Approval = {
  type: 'object',
  properties: {
    type: {
      enum: ['delegate-individual', 'delegate-organisation','delegate-party', 'candidate'],
    },
    approved: {
      type: 'boolean'
    },
    approvedBy: {
      type: 'string'
    },
    approvedOn: {
      faker: 'date.past'
    },
    createdAt: {
      faker: 'date.past'
    }
  }
};

export const Credential = {
  type: 'object',
  properties: {
    source: {
      enum: ['facebook', 'twitter', 'google', 'script', 'default'],
    },
    URL: {
      faker: 'internet.url'
    },
    validated: {
      type: 'boolean'
    }
  }
};

export const Profile = {
  type: 'object',
  properties: {
    firstName: {
      faker: 'name.firstName',
    },
    lastName: {
      faker: 'name.lastName'
    },
    photo: {
      faker: 'image.imageUrl'
    },
    credentials: {
      type: 'array',
      items: {
        type: Credential
      }
    },
  }
};

export const User = {
  type: 'object',
  properties: {
    username: {
      faker: 'internet.userName'
    },
    emails: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          address: {
            faker: 'internet.email'
          },
          verified: {
            type: 'boolean'
          }
        },
        required: [
          'address',
          'verified'
        ]
      }
    },
    createdAt: {
      faker: 'date.past'
    },
    isPublic: {
      type: 'boolean'
    },
    profile: {
      type: Profile
    },
    services: {
      type: 'object'
    },
    roles: {
      type: 'object'
    },
    roles: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    heartbeat: {
      faker: 'date.past'
    }
  },
  required: [
  'username',
  'emails',
  'isPublic',
  'profile',
  'createdAt'
  ]
};
