import { Meteor } from 'meteor/meteor'
import { ServiceConfiguration } from 'meteor/service-configuration';
import { Accounts } from 'meteor/accounts-base';

ServiceConfiguration.configurations.remove({
    service: "facebook"
});

ServiceConfiguration.configurations.remove({
    service: "google"
});

ServiceConfiguration.configurations.remove({
    service: "twitter"
});

ServiceConfiguration.configurations.insert({
    service: "facebook",
    appId: Meteor.settings.private.oAuth.facebook.appId,
    secret: Meteor.settings.private.oAuth.facebook.secret,
    loginStyle: 'redirect',
    //loginStyle: "popup",
});

ServiceConfiguration.configurations.insert({
  service: 'google',
  clientId: Meteor.settings.private.oAuth.google.clientId,
  secret: Meteor.settings.private.oAuth.google.secret,
  loginStyle: 'redirect',
});

ServiceConfiguration.configurations.insert({
  service: 'twitter',
  consumerKey: Meteor.settings.private.oAuth.twitter.consumerKey,
  secret: Meteor.settings.private.oAuth.twitter.secret,
  loginStyle: 'redirect',
});