// Import client startup through a single index entry point

import './routes.js';
import RavenClient from 'raven-js';


/* makes FlowRouter wait until roles are initialised
else isInRole always returns false, as per
https://medium.com/@satyavh/using-flow-router-for-authentication-ba7bb2644f42  */
FlowRouter.wait();
Tracker.autorun(function() {
  if (Roles.subscription.ready() && !FlowRouter._initialized) {
    return FlowRouter.initialize();
  }
});

Meteor.startup(function () {
  // Client startup method.
  var subdomain = window.location.host.split('.')[0]
  var rootUrl = 'https://' + subdomain + Meteor.settings.public.domain;
  process.env.ROOT_URL = rootUrl;

  var sentryDSN = Meteor.settings.public.sentryPublicDSN;
  RavenClient.config(sentryDSN).install();
});