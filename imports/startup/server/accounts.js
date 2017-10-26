import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles';
import { convertToSlug } from '/lib/utils';
import { Random } from 'meteor/random';

function normalizeFacebookUser(profile, user) {
  console.log("0.2 normalizeFacebookUser");
  const credential = profile.credentials || [];
  credential.push({
    source: 'facebook',
    URL: user.services.facebook.link,
    validated: true,
  });

  const userProfile = _.extend(profile, {

    picture: 'http://graph.facebook.com/' + user.services.facebook.id + '/picture/?type=large',
    username: user.services.facebook.first_name + " " + user.services.facebook.last_name,
    firstName: user.services.facebook.first_name,
    lastName: user.services.facebook.last_name,
    credentials: credential,
    isPublic: false
  });

  const userEmail = {
    address: user.services.facebook.email,
    verified: false
  };

  return _.extend(user, {
    //username,
    profile: userProfile,
    emails: [userEmail]
  });
}

function normalizeGoogleUser(profile, user) {
  console.log("0.2 normalizeGoogleUser");
  const credential = profile.credentials || [];
  credential.push({
    source: 'google',
    validated: true,
  });

  const userProfile = _.extend(profile, {
    picture: user.services.google.picture,
    username: user.services.google.given_name + " " + user.services.google.family_name,
    firstName: user.services.google.given_name,
    lastName: user.services.google.family_name,
    credentials: credential,
    isPublic: false
  });
  const userEmail = {
    address: user.services.google.email,
    verified: false
  };

  return _.extend(user, {
    //username,
    profile: userProfile,
    emails: [userEmail]
  });
}

function normalizeTwitterUser(profile, user) {
  console.log(profile);
  console.log(user);
  console.log("0.2 normalizeTwitterUser");
  const credential = profile.credentials || [];
  credential.push({
    source: 'twitter',
    URL: 'http://www.twitter.com',
    validated: true,
  });

  const userProfile = _.extend(profile, {

    picture: user.services.twitter.profile_image_url_https,
    username: user.services.twitter.screenName,
    firstName: profile.name,
    lastName: '',
    credentials: credential,
    isPublic: false
  });

  const userEmail = {
    address: '',
    verified: false
  };

  return _.extend(user, {
    //username,
    profile: userProfile,
    emails: [userEmail]
  });
}

function normalizeSignupUser(user) {
  console.log("0.2 normalizeSignupUser");
  const credential =[];
  credential.push({
    source: 'signup',
    URL: 'http://www.commondemocracy.org/',
    validated: false,
  });
  const userProfile = {
    picture: "/img/default-user-image.png",
    username: "anonymous",
    firstName: "Anonymous",
    lastName: "User",
    isPublic: false
  };
  Meteor.call('profiles.initiate', user._id,userProfile,(error) => {
        if(error){
          Bert.alert({
              title: 'oh dear',
              message: error,
              type: 'danger',
              style: 'growl-bottom-right',
              icon: 'fa-hand-spock-o'
          });
        }
      });
  return _.extend(user, {
    //username,
    profile: userProfile,
  });
}
//given a user profile it returns a slugged version of her name
function slugName(profile) {
  var name = new String();
  if (profile != undefined) {
    if (profile.firstName != undefined) {
      name = convertToSlug(profile.firstName);
    }
    if (profile.lastName != undefined) {
      name += '-' + convertToSlug(profile.lastName);
    }
    if (name.length == 0) {
      name = convertToSlug(TAPi18n.__('anonymous'));
    }
  }
  return name;
}

Accounts.onCreateUser((options, user) => {
  console.log("0. let's start the oncreate process");

  // _.extend(user.profile, { delegate: {verified: false,nominated: true,eligible: false,nominations: []}});
  const profile = options.profile;
  if (profile) {
    if (user.services.facebook) {
      normalizeFacebookUser(profile, user);
    }
    if (user.services.google) {
      normalizeGoogleUser(profile, user);
    }
    if (profile.demo) {
      normalizeDemoUser(profile, user);
      Meteor.call('profiles.initiate_demo', user._id,(error) => {
        if(error){
          Bert.alert({
              title: 'oh dear',
              message: error,
              type: 'danger',
              style: 'growl-bottom-right',
              icon: 'fa-hand-spock-o'
          });
        }
      });
    }
    if (user.services.twitter) {
      return normalizeTwitterUser(profile, user);
    }
  }else{
    normalizeSignupUser(user); 
  }

  return user;
});



Accounts.onLogin(function(user){
  //console.log(user);
});

Accounts.validateNewUser((user) => {

  console.log("1. validating username on creation");

  //assign random username
  let username = Random.id();
  return _.extend(user, {
    username,
  })
});


