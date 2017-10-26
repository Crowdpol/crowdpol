// Import server startup through a single index entry point
import { Meteor } from 'meteor/meteor';
import './fixtures.js';
import './register-api.js';
import "./accounts.js";
import "./configure-services.js";

Meteor.startup(() => {
	
  // code to run on server at startup
  console.log("Common Democracy: Sweden - started...");
  //Meteor.call("createAdmins");

});


//http://blog.mailgun.com/25-465-587-what-port-should-i-use/
process.env.MAIL_URL = "smtps://postmaster%40mg.commondemocracy.org:1bbade5a02f2baf06efc2da5b1d76cc6@smtp.mailgun.org:465";