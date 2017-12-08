/*
		    welcome to
	      ___    ___     ___ ___     ___ ___     ___     ___
		 /'___\ / __`\ /' __` __`\ /' __` __`\  / __`\ /' _ `\
		/\ \__//\ \L\ \/\ \/\ \/\ \/\ \/\ \/\ \/\ \L\ \/\ \/\ \
  __	\ \____\ \____/\ \_\ \_\ \_\ \_\ \_\ \_\ \____/\ \_\ \_\
 /\ \	 \/____/\/___/  \/_/\/_/\/_/\/_/\/_/\/_/\/___/  \/_/\/_/
 \_\ \     __    ___ ___     ___     ___   _ __    __      ___   __  __
 /'_` \  /'__`\/' __` __`\  / __`\  /'___\/\`'__\/'__`\   /'___\/\ \/\ \
/\ \L\ \/\  __//\ \/\ \/\ \/\ \L\ \/\ \__/\ \ \//\ \L\.\_/\ \__/\ \ \_\ \
\ \___,_\ \____\ \_\ \_\ \_\ \____/\ \____\\ \_\\ \__/.\_\ \____\\/`____ \
 \/__,_ /\/____/\/_/\/_/\/_/\/___/  \/____/ \/_/ \/__/\/_/\/____/ `/___/> \
																	 /\___/
																	\/__/
		this only looks pretty at tab size: 2)
*/

import { Meteor } from 'meteor/meteor';
//import { TAPi18n } from 'meteor/tap:i18n';
import { Session } from 'meteor/session';

// Import needed templates
import './layouts/body/body.js';
import './components/loader/loader.js';
import './components/taggle/taggle.js';
import './pages/home/home.js';
import './pages/not-found/not-found.js';
import './pages/authenticate/authenticate.js';
import './pages/dash/dash.js';
import './pages/resetPassword/newPassword/newPassword.js';
import './pages/resetPassword/recoverPassword/recoverPassword.js';
import './pages/contact/contact.js';
import './pages/admin/dash.js';
import './pages/profile/profile.js';
import './pages/tags/tags.js';
import './pages/about.html';
import './pages/privacy.html';
import './pages/terms.html';
import './pages/proposals/editProposal.js';
import './pages/proposals/viewProposal.js';
import './pages/proposals/delegateVoteButtons.js';
import './pages/proposals/proposalsList.js';
import './pages/delegates/delegate.js';
import './pages/candidates/candidates.js';
//import './pages/stats/stats.js';
import './stylesheets/stylesheets.js';


Meteor.startup(function () {
	// setup language
	Session.set('showLoadingIndicator', true);

	//set default language to english
	Session.set("i18n_lang", "en");

	// internationalization library
	TAPi18n.setLanguage("en")
		.done(function () {
			Session.set("showLoadingIndicator", false);
		})
		.fail(function (error_message) {
			// Handle the situation
			console.log(error_message);
		});

});
