import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles';
import { convertToSlug } from '/lib/utils';
import { Random } from 'meteor/random';

function generateSearchString(user){
  const profile = user.profile;
  searchString = profile.username + " " + profile.firstName + " " + profile.lastName;
  const userProfile = _.extend(profile, {
    searchString: searchString
  });
  return user;
}

function normalizeFacebookUser(profile, user) {
  //console.log("0.2 normalizeFacebookUser");
  const credential = profile.credentials || [];
  credential.push({
    source: 'facebook',
    URL: user.services.facebook.link,
    validated: true,
  });
  //searchString = user.services.facebook.first_name + ' ' + user.services.facebook.last_name + ' ' + generateUsername(user.services.facebook.first_name,user.services.facebook.last_name);
  const userProfile = _.extend(profile, {

    photo: 'http://graph.facebook.com/' + user.services.facebook.id + '/picture/?type=large',
    username: generateUsername(user.services.facebook.first_name,user.services.facebook.last_name),
    firstName: user.services.facebook.first_name,
    lastName: user.services.facebook.last_name,
    credentials: credential,
    isPublic: false,
    type: 'Individual',
    //searchString: searchString
  });

  const userEmail = {
    address: user.services.facebook.email,
    verified: false
  };

  return _.extend(user, {
    //username,
    profile: userProfile,
    emails: [userEmail],
    roles: ['individual']
  });
}

function normalizeGoogleUser(profile, user) {
  //console.log("0.2 normalizeGoogleUser");
  const credential = profile.credentials || [];
  credential.push({
    source: 'google',
    validated: true,
  });

  const userProfile = _.extend(profile, {
    photo: user.services.google.picture,
    username: generateUsername(user.services.google.given_name + " " + user.services.google.family_name),
    firstName: user.services.google.given_name,
    lastName: user.services.google.family_name,
    credentials: credential,
    isPublic: false,
    type: 'Individual',
    //searchString: user.services.google.given_name + ' ' + user.services.google.family_name + ' ' + generateUsername(user.services.google.given_name + " " + user.services.google.family_name);
  });
  const userEmail = {
    address: user.services.google.email,
    verified: false
  };

  return _.extend(user, {
    //username,
    profile: userProfile,
    emails: [userEmail],
    roles: ['individual']
  });
}

function normalizeTwitterUser(profile, user) {
  //console.log(profile);
  //console.log(user);
  //console.log("0.2 normalizeTwitterUser");
  const credential = profile.credentials || [];
  credential.push({
    source: 'twitter',
    URL: 'http://www.twitter.com',
    validated: true,
  });

  const userProfile = _.extend(profile, {

    photo: user.services.twitter.profile_image_url_https,
    username: generateUsername(user.services.twitter.screenName),
    firstName: profile.name,
    lastName: '',
    credentials: credential,
    isPublic: false,
    type: 'Individual',
    //searchString: profile.name + " "  + generateUsername(user.services.twitter.screenName);
  });

  const userEmail = {
    address: user.services.twitter.email,
    verified: false
  };

  return _.extend(user, {
    //username,
    profile: userProfile,
    emails: [userEmail],
    roles: ['individual']
  });
}

function normalizeSignupUser(user) {
  //console.log("0.2 normalizeSignupUser");
  const credential =[];
  credential.push({
    source: 'signup',
    URL: 'http://www.commondemocracy.org/',
    validated: false,
  });
  const userProfile = {
    photo: Meteor.settings.private.defaultPhotoUrl,
    username: generateUsername("anonymous"),
    firstName: "Anonymous",
    lastName: "User",
    isPublic: false,
    type: 'Individual',
    //searchString: "Anonymous anonymous";
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
    roles: ['individual']
  });
}

function normalizeScriptUser(profile, user) {
  //console.log("0.2 normalizeScriptUser");
  //console.log(profile);
  const credential =[];
  credential.push({
    source: 'script',
    URL: 'http://www.commondemocracy.org/',
    validated: true,
  });
  const userProfile = _.extend(profile, {
    photo: profile.photo,
    username: profile.username,
    firstName: profile.firstName,
    lastName: profile.lastName,
    isPublic: true,
    type: profile.type,
    //searchString: profile.firstName + ' ' + profile.lastName + ' ' + profile.username;
  });
  return _.extend(user, {
    //username,
    profile: userProfile,
  });
}

function normalizeDemoUser(profile, user) {
  console.log("0.2 normalizeDemoUser");
  const credential =[];
  credential.push({
    source: 'demo',
    URL: 'http://www.commondemocracy.org/',
    validated: true,
  });
  const userProfile = _.extend(profile, {
    photo: profile.photo,
    username: generateUsername(profile.firstName + " " + profile.lastName),
    firstName: profile.firstName,
    lastName: profile.lastName,
    isPublic: false,
    type: 'Individual',
    //searchString: profile.firstName + ' ' + profile.lastName + ' ' + generateUsername(profile.firstName + " " + profile.lastName);
  });
  return _.extend(user, {
    //username,
    profile: userProfile,
    roles: ['individual']
  });
}

//given a user profile it returns a slugged version of her name
function slugName(firstName,lastName) {
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
  //console.log("0. let's start the oncreate process");
  //console.log(options);
  //console.log("-");
  //console.log(user);
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
    if(options.profile.credentials[0].source == "default"){
      normalizeScriptUser(profile, user);
    }

  }else{
    normalizeSignupUser(user); 
  }
  generateSearchString(user);
  return user;
});



Accounts.onLogin(function(user){
  //console.log(user);
});

Accounts.validateNewUser((user) => {

  //console.log("1. validating username on creation");

  //assign random username
  let username = Random.id();
  return _.extend(user, {
    username,
  })
});

generateUsername = function(firstName,lastName) {
  var username = new String();
  if (firstName != undefined) {
    username = convertToSlug(firstName);
  }
  if (lastName != undefined) {
    username += '-' + convertToSlug(lastName);
  }
  if (username.length == 0) {
    username = convertToSlug(TAPi18n.__('anonymous'));
  }
  var count = Meteor.users.find({'profile.username': username}).count();
  if(count > 0){
    username += "-" + (count+1);
  }
  return username;
}


