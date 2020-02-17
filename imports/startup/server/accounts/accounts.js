import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles';
import { convertToSlug } from '/lib/utils';
import { Random } from 'meteor/random';
import { getCommunity } from '../../../utils/community.js';

function generateSearchString(user){
  const profile = user.profile;
  searchString = profile.username + " " + profile.firstName + " " + profile.lastName;
  const userProfile = _.extend(profile, {
    searchString: searchString
  });
  return user;
}

function normalizeFacebookUser(profile, user) {
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
    termsAccepted : true
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
    termsAccepted : true,
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
    termsAccepted : true
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

function normalizeSignupUser(profile, user) {
  const credential =[];
  credential.push({
    source: 'signup',
    URL: 'http://www.crowdpol.com/',
    validated: false,
  });
  console.log("------------------------------------");
  console.log("profile: ");
  console.log(profile);
  const userProfile = _.extend(profile, {
    photo: "/img/default-user-image.png",
    username: generateUsername("anonymous"),
    firstName: "Anonymous",
    lastName: "User",
    isPublic: false,
    type: 'Individual'
  });
  return _.extend(user, {
    //username,
    profile: userProfile,
    roles: ['individual']
  });
}

function normalizeEntity(profile, user) {
  const credential =[];
  credential.push({
    source: 'signup',
    URL: 'http://www.crowdpol.com/',
    validated: false,
  });

  const userProfile = {
    firstName: profile.firstName,
    website: profile.website,
    phoneNumber: profile.phoneNumber,
    contactPerson: profile.contactPerson,
    type: 'Entity',
    photo: Meteor.settings.private.defaultPhotoUrl,
    username: generateUsername("anonymous_entity"),
    isPublic: false,
    termsAccepted: profile.termsAccepted
  };

  return _.extend(user, {
    //username,
    profile: userProfile,
    roles: profile.roles
  });
}

function normalizeScriptUser(profile, user) {
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
  console.log("--options:---");
  console.log(options);
  console.log("-----");
  let profile = options.profile;
  /*
  if(options){
    if(typeof options.profile !== 'undefined'){

      Meteor.call('getRootCommunities',function(err, result){
        if (err) {
          Bert.alert(err.reason, 'danger');
        } else {
          console.log(result);
          if(result){
            const userProfile = _.extend(profile, {
              profile.communityIds: result,
            });
            console.log("_3.1.userprofile set____");
            console.log("userProfile: ")
            console.log(userProfile);
            console.log("_3.2.profileset____");
            console.log("profile: ")
            console.log(profile);
            console.log("__reutrning profile___");
          }
        }
      });
    }else{
      console.log(options);
      let profile = {
        credential: {},
        firstName: "Anonymous",
        lastName: "User",
        isPublic: false,
        type: 'Individual',
      };
      console.log("_2.basics set____");
      console.log("profile: ")
      console.log(profile);
      console.log("_____");
    }
  }else{
    console.log("no options in setRootCommunities");
  }

  console.log("---calling getRootCommunities()---");
  */
  profile.communityIds = Meteor.call('getRootCommunities');
  /*
  Meteor.call('getRootCommunities',function(err, result){
    if (err) {
      console.log(err);
      Bert.alert(err.reason, 'danger');
    } else {
      //console.log(result);
      if(result){
        console.log("--profile before chainging community ids:---");
        console.log(profile);
        console.log("-----");
        profile.communityIds = result;
        console.log("--profile.communityIds after being set:---");
        console.log(profile.communityIds);
        console.log("-----");
      }else{
        console.log("no result from getRootCommunities");
      }
    }
  });

  console.log("---getRootCommunities() finished---");
  console.log("--profile:---");
  console.log(profile);
  console.log("-----");
  */
  console.clear();
  console.log("starting to normalise");

	let email;
	let firstName;
	let lastName;
	let service;
  let social = false;

	if (user.services.facebook) {
    social=true;
    console.log("user signing in with facebook");
			firstName = user.services.facebook.first_name;
			lastName = user.services.facebook.last_name;
			email = user.services.facebook.email;
			service = 'facebook';
	}
  if (user.services.google) {
    social=true;
    console.log("user signing in with google");
			firstName = user.services.google.given_name;
			lastName = user.services.google.family_name;
			email = user.services.google.email;
			service = 'google';
	}
  if(user.services.twitter){
    social=true;
    console.log("user signing in with twitter");
    console.log(user.services.twitter)

	}
  if(!social){
    console.log("user is signing in with email address")
    firstName = '';
    lastName = '';
    email = options.email;
    service = 'password';
    verified = false;
  }

  let existingUser = Meteor.users.findOne({"emails.address": email });
	if (existingUser) {
    console.log("found existingUser");
			existingUser.services = existingUser.services || {};
			existingUser.services[service] = user.services[service];
			//Meteor.users.remove({ _id: existingUser._id });
			//user = existingUser;
      console.log(existingUser);
	}
  if (profile) {
    if (user.services.facebook) {
      return normalizeFacebookUser(profile, user);
    }
    if (user.services.google) {
      return normalizeGoogleUser(profile, user);
    }
    if (profile.type == 'Entity') {
      return normalizeEntity(profile, user);
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
    if(options.profile.credentials) {
      if(options.profile.credentials[0].source == "default"){
        return normalizeScriptUser(profile, user);
      }
    }
    normalizeSignupUser(profile, user);
    generateSearchString(user);
  }else{
    console.log("profile undefined");
    console.log("user:");
    console.log(user);
  }


  return user;
});

Accounts.onLogin(() => {
  console.log("onLogin called: user logged in");
});
Accounts.validateNewUser((user) => {

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

function setRootCommunities(options){

}
