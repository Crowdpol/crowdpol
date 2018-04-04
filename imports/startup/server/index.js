// Import server startup through a single index entry point
import { Meteor } from 'meteor/meteor';
import './fixtures.js';
import './register-api.js';
import './cron-jobs.js';
import "./accounts/accounts.js";
import "./accounts/configure-services.js";
import Raven from 'raven';

var sentryDSN = Meteor.settings.private.sentryPrivateDSN;
Raven.config(sentryDSN).install();

/*
    From a gist by Tom Fletcher: https://gist.github.com/TimFletcher/57e2b9b81501a9e5326cf4899ff010f5
    Wraps all meteor method calls so that uncaught exceptions are logged to Sentry automatically.
*/

const wrapMethodHanderForErrors = function wrapMethodHanderForErrors(name, originalHandler, methodMap) {
	methodMap[name] = function() {
		try{
			return originalHandler.apply(this, arguments);
		} catch(ex) {
			Raven.captureException(ex);
			throw ex;
		}
	}
};

export const wrapMethods = function() {
	var originalMeteorMethods = Meteor.methods;
    // wrap future method handlers for capturing errors
    Meteor.methods = function(methodMap) {
    	Object.keys(methodMap)
    	.map(name => ({
    		handler: methodMap[name],
    		name
    	}))
    	.forEach(function({handler, name}) {
    		wrapMethodHanderForErrors(name, handler, methodMap);
    	});
    	originalMeteorMethods(methodMap);
    };

    // wrap existing method handlers for capturing errors
    Object.keys(Meteor.default_server.method_handlers)
    .map(name => ({
    	handler: Meteor.default_server.method_handlers[name],
    	name
    }))
    .forEach(function ({handler, name}) {
    	wrapMethodHanderForErrors(name, handler, Meteor.default_server.method_handlers);
    });
};

/*
    Startup Function:
*/


Meteor.startup(() => {
  // code to run on server at startup
  console.log("Common Democracy: Sweden - started...");
  wrapMethods();
});

process.env.ROOT_URL = "https://bangor.socialsystems.io";
//http://blog.mailgun.com/25-465-587-what-port-should-i-use/
process.env.MAIL_URL = Meteor.settings.private.mailGun;

