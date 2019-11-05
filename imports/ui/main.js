/*
		    welcome to
 __   __   __        __   __   __
/  ` |__) /  \ |  | |  \ |__) /  \ |
\__, |  \ \__/ |/\| |__/ |    \__/ |___

*/

import { Meteor } from 'meteor/meteor';
//import { TAPi18n } from 'meteor/tap:i18n';
import { Session } from 'meteor/session';

// Import needed templates
import './layouts/body/body.js';
import './components/main.js';
import './pages/home/home.js';
import './pages/landing/landing.js';
import './pages/ideas/ideas.js';
import './pages/faq/faq.js';
import './pages/feed/userFeed.js';
import './pages/settings/profileSettings.js';
import './pages/settings/accountSettings.js';
import './pages/not-found/not-found.js';
import './pages/authenticate/authenticate.js';
import './pages/dash/dash.js';
import './pages/resetPassword/newPassword/newPassword.js';
import './pages/resetPassword/recoverPassword/recoverPassword.js';
import './pages/contact/contact.js';
import './pages/admin/dash.js';
import './pages/profile/profile.js';
import './pages/tags/tags.js';
import './pages/about/about.js';
import './pages/privacy.html';
import './pages/terms.html';
import './pages/proposals/userProposalList.js';
import './pages/proposals/communityProposals.js';
import './pages/proposals/editProposal.js';
import './pages/proposals/viewProposal.js';
import './pages/proposals/signInModal/signInModal.js';
import './pages/proposals/proposalsList.js';
import './pages/voting/voting.js';
import './pages/delegates/delegate.js';
import './pages/communities/communities.js';
//import './pages/candidates/candidates.js';
import './pages/notifications/notifications.js';
import './pages/group/group.js';
import './pages/compass/compass.js';
import './pages/tags/interests.js';
import './pages/presence/userPresence.js';
import './pages/test/test.js';
import './pages/test/test.js';
import './pages/not-found/not-found.js';
import './stylesheets/stylesheets.js';
import './v2/main.js';

Meteor.startup(function () {
	/*
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
	*/
});
