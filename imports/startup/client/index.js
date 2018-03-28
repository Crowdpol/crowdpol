// Import client startup through a single index entry point

import './routes.js';
import ravenClient from 'raven-js';


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
  Meteor.absoluteUrl.defaultOptions.rootUrl = 'http://www.commondemocracy.org/';

  let sentryURL = 'https://c6e49c45d8d3483a9277ed5956d83f7a@sentry.io/624207'//'https://' + Meteor.settings.public.sentryPublicKey + "@sentry.io/" + Meteor.settings.public.sentryAppId;

	ravenClient.config(sentryURL, {
	    shouldSendCallback: function(data) {
	        return true;//return Meteor.settings.public.environment !== "development";
	    }
	}).install();
});