import { Meteor } from 'meteor/meteor';
import { Profiles } from "../Profiles.js"

// on the server
Meteor.publish('users', function(author) {
  return  Meteor.users.find({}, {fields: {profile: true}});
});

Meteor.publish('profiles', () =>
  Profiles.find()
);

Meteor.publish('profiles.candidates', () =>
  Profiles.find({isCandidate: true})
);

Meteor.publish('profiles.organisations', () =>
  Profiles.find({isOrganisation: true})
);


