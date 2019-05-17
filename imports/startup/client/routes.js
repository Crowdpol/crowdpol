import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// Import needed templates
import '../../ui/main.js';

// Global onEnter trigger to save communityInfo in LocalStore
FlowRouter.triggers.enter([loadCommunityInfo]);

// the App_notFound template is used for unknown routes and missing lists
FlowRouter.notFound = {
  action() {
    BlazeLayout.render('App_body', {main: 'App_notFound'});
  }
};

// Public Routes (no need to log in):

var publicRoutes = FlowRouter.group({name: 'public'});

Accounts.onLogout(function() {
	FlowRouter.go('App.home');
});

publicRoutes.route('/', {
  name: 'App.home',
  action() {
    let subdomain = LocalStore.get('subdomain');
    if(subdomain=='landing'){
      BlazeLayout.render('App_body', { main: 'Landing' });
    }else{
      BlazeLayout.render('App_body', { main: 'Home' });
    }

  },
});

publicRoutes.notFound = {
  action() {
    BlazeLayout.render('App_body', { main: 'App_notFound' });
  },
};

// Email Verification
publicRoutes.route('/verify-email/:token',{
	name: 'verify-email',
	action(params) {
		Accounts.verifyEmail(params.token, (error) => {
			if (error) {
				Bert.alert(error.reason, 'danger');
			} else {
        // If user is an organisation or party, create approval request for admin
        if (Roles.userIsInRole(Meteor.userId(), ['organisation-delegate', 'party-delegate'])){
          approval = {type: Meteor.user().roles[0], approved: false, createdAt: new Date()};
          Meteor.call('addApproval', Meteor.userId(), approval);
          Bert.alert(TAPi18n.__('routes.alerts.verify-success-alert-entity'), 'success');
        } else {
          Bert.alert(TAPi18n.__('routes.alerts.verify-success-alert-entity'), 'success');
        }
        FlowRouter.go('App.dash')
			}
		});
	}
});

publicRoutes.route('/reset-password/:token?', {
  name: 'App.password-recovery',
  action(params) {
    if (params.token) {
      Accounts._resetPasswordToken = params.token
      BlazeLayout.render('App_body', { main: 'newPassword' });
    } else {
      BlazeLayout.render('App_body', { main: 'recoverPassword' });
    }
  }
});

publicRoutes.route('/login', {
  name: 'App.login',
  action() {
    if (!Meteor.user()){
      BlazeLayout.render('App_body', { main: 'Authenticate' });
    }else{
      BlazeLayout.render('App_body', { main: 'ProposalsList' });
    }
  },
});
publicRoutes.route('/signup', {
  name: 'App.login',
  action() {
    if (!Meteor.user()){
      BlazeLayout.render('App_body', { main: 'Authenticate' });
    }else{
      BlazeLayout.render('App_body', { main: 'ProposalsList' });
    }
  },
});

publicRoutes.route('/contact', {
  name: 'App.contact',
  action() {
    BlazeLayout.render('App_body', { main: 'contact' });
  },
});

publicRoutes.route('/notifications', {
  name: 'App.notifications',
  action() {
    BlazeLayout.render('App_body', { main: 'Notifications' });
  },
});

publicRoutes.route('/privacy', {
  name: 'App.privcay',
  action() {
    BlazeLayout.render('App_body', { main: 'Privacy' });
  },
});

publicRoutes.route('/terms', {
  name: 'App.terms',
  action() {
    BlazeLayout.render('App_body', { main: 'Terms' });
  },
});

publicRoutes.route('/about', {
  name: 'App.about',
  action() {
    BlazeLayout.render('App_body', { main: 'About' });
  },
});

publicRoutes.route('/faq', {
  name: 'App.faq',
  action() {
    BlazeLayout.render('App_body', { main: 'FAQ' });
  },
});

publicRoutes.route('/settings', {
  name: 'App.account-settings',
  action() {
    BlazeLayout.render('App_body', { main: 'AccountSettings' });
  },
});

publicRoutes.route('/unsplash', {
  name: 'App.unsplash',
  action() {
    BlazeLayout.render('App_body', { main: 'Unsplash' });
  },
});

publicRoutes.route('/test', {
  name: 'App.test',
  action() {
    BlazeLayout.render('App_body', { main: 'Test' });
  },
});

//USER SEARCH
FlowRouter.route('/search/users', {
  name: 'App.search.users',
  action() {
    BlazeLayout.render('App_body', { main: 'UserSearch' });
  },
});


//STATISTICS
FlowRouter.route('/stats', {
  name: 'App.stats',
  action() {
    BlazeLayout.render('App_body', { main: 'Stats' });
  },
});

var statsRoutes = FlowRouter.group({
  prefix: '/stats',
  name: 'App.stats',
});

statsRoutes.route('/proposals', {
  name: 'App.stats.proposals',
  action() {
    BlazeLayout.render('App_body', {main: 'ProposalStats'});
  }
});
statsRoutes.route('/proposals/:id', {
  name: 'App.stats.proposals.view',
  action() {
    BlazeLayout.render('App_body', { main: 'ProposalStatsPage' });

  },
});

// Routes for logged-in users only:

var loggedInRoutes = FlowRouter.group({
  name: 'loggedIn',
  triggersEnter: [function(context, redirect) {
    if ((!Meteor.user()) || (!_.contains(Meteor.user().profile.communityIds, LocalStore.get('communityId')))){
	    FlowRouter.go('App.home');
	    Bert.alert(TAPi18n.__('pages.routes.alerts.login-to-view'), 'danger');
  	}
  }]
});


loggedInRoutes.route('/profile', {
  name: 'App.profile',
  action() {
    BlazeLayout.render('App_body', { main: 'ProfileSettings' });
  },
});
/*
loggedInRoutes.route('/profile/:id', {
  name: 'App.profile',
  action() {
    BlazeLayout.render('App_body', { main: 'Profile' });

  },
});
*/
loggedInRoutes.route('/feed', {
  name: 'App.feed',
  action() {
    BlazeLayout.render('App_body', { main: 'UserHome' });
  },
});

loggedInRoutes.route('/feed/:id', {
  name: 'App.feed',
  action() {
    BlazeLayout.render('App_body', { main: 'UserHome' });
  },
});


loggedInRoutes.route('/dash', {
  name: 'App.dash',
  action() {
    BlazeLayout.render('App_body', { main: 'Dash' });
  },
});


loggedInRoutes.route('/ideas', {
  name: 'App.ideas',
  action() {
    BlazeLayout.render('App_body', { main: 'Ideas' });
  },
});

loggedInRoutes.route('/tag/:keyword', {
  name: 'App.tag',
  action() {
    BlazeLayout.render('App_body', {main: 'TagSearch'});
  }
});

loggedInRoutes.route('/interests', {
  name: 'App.interests',
  action() {
    BlazeLayout.render('App_body', {main: 'Interests'});
  }
});

loggedInRoutes.route('/voting', {
  name: 'App.voting',
  action() {
    BlazeLayout.render('App_body', {main: 'Voting'});
  }
});

loggedInRoutes.route('/proposals', {
  name: 'App.proposals',
  action() {
    BlazeLayout.render('App_body', {main: 'ProposalsList'});
  }
});

loggedInRoutes.route('/proposals/edit/:id?', {
  name: 'App.proposal.edit',
  action() {
    BlazeLayout.render('App_body', {main: 'EditProposal'});
  }
});

/* Users without an account can see individual proposals */

FlowRouter.route('/proposals/view/:id', {
  name: 'App.proposal.view',
  action() {
    BlazeLayout.render('App_body', {main: 'ViewProposal'});
  }
});

loggedInRoutes.route('/delegate', {
  name: 'App.delegate',
  action() {
    BlazeLayout.render('App_body', { main: 'Delegate' });
  },
});
/*
loggedInRoutes.route('/candidate', {
  name: 'App.candidate',
  action() {
    BlazeLayout.render('App_body', { main: 'Candidate' });
  },
});
*/
// Admin Routes:

var adminRoutes = FlowRouter.group({
  prefix: '/admin',
  name: 'admin',
  triggersEnter: [function(context, redirect) {
    if (!Roles.userIsInRole(Meteor.user(), ['admin','superadmin','community-admin'])){
      FlowRouter.go('App.home');
    }
  }]
});

adminRoutes.route('/dash', {
  name: 'App.admin.users',
  action() {
    BlazeLayout.render('App_body', { main: 'AdminDash' });
  },
});

adminRoutes.route('/users', {
  name: 'App.admin.users',
  action() {
    BlazeLayout.render('App_body', { main: 'AdminUsers' });
  },
});

adminRoutes.route('/tags', {
  name: 'App.admin.tags',
  action() {
    BlazeLayout.render('App_body', { main: 'AdminTags' });
  },
});

FlowRouter.route('/tag/:keyword', {
  name: 'App.tag',
  action() {
    BlazeLayout.render('App_body', {main: 'TagSearch'});
  }
});

adminRoutes.route('/approvals', {
  name: 'App.approvals',
  action() {
    BlazeLayout.render('App_body', {main: 'AdminApprovals'});
  }
});

adminRoutes.route('/proposals', {
  name: 'App.admin.proposals',
  action() {
    BlazeLayout.render('App_body', {main: 'AdminProposals'});
  }
});

adminRoutes.route('/voting', {
  name: 'App.admin.voting',
  action() {
    BlazeLayout.render('App_body', {main: 'AdminVoting'});
  }
});

adminRoutes.route('/communities', {
  name: 'App.admin.communities',
  action() {
    BlazeLayout.render('App_body', {main: 'AdminCommunities'});
  }
});

function loadCommunityInfo() {
  //check for crowdpol:
  var hostname = window.location.host;
  var subdomain = window.location.host.split('.')[0];
  //console.log("hostname: " + hostname);
  //console.log("subdomain: "  + subdomain);
  switch (hostname) {
    case "crowdpol.com":
        subdomain = "landing";
        break;
    case "www.crowdpol.com":
        subdomain = "landing";
        break;
    case "crowdpol.org":
        subdomain = "landing";
        break;
    case "www.crowdpol.org":
        subdomain = "landing";
        break;
    case "commondemocracy.org":
        subdomain = "landing";
        break;
    case "www.commondemocracy.org":
        subdomain = "landing";
        break;
    case "www.syntropi.se":
        subdomain = "landing";
        break;
    case "localhost:3000":
        subdomain = "landing";
        break;
    /*
    default:
        subdomain = "landing";//window.location.host.split('.')[0];
    */
  }
	//set title to commuinty name
	document.title = subdomain.charAt(0).toUpperCase() + subdomain.slice(1);
  //console.log("subomdain after case: " + subdomain);
  LocalStore.set('subdomain', subdomain);
  // set LocalStorage info
  if (subdomain!=='landing'){

      Meteor.call('getCommunityBySubdomain', subdomain, function(err, result) {
        if (err) {
          Bert.alert(err.reason, 'danger');
        } else {
          if(typeof result._id !== 'undefined'){
            LocalStore.set('communityId', result._id);
  					LocalStore.set('settings',result.settings);
  					let settings = result.settings;

  					//set favicon if community icon is set
  					if(typeof settings.faviconUrl != 'undefined'){
  						var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
  						//link.type = 'image/x-icon';
  						link.rel = 'shortcut icon';
  						link.href = settings.faviconUrl;
  						document.getElementsByTagName('head')[0].appendChild(link);
  					}
  					if(typeof settings.defaultLanguage != 'undefined'){
  						//console.log(settings.defaultLanguage);
  						moment.locale(settings.defaultLanguage);
  					}
          }
        }
      });
  } else {
    //Bert.alert(TAPi18n.__('pages.routes.alerts.no-subdomain'), 'danger');
    //console.log(TAPi18n.__('pages.routes.alerts.no-subdomain'));
  }
}
/*
(function() {
    var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = 'http://www.stackoverflow.com/favicon.ico';
    document.getElementsByTagName('head')[0].appendChild(link);
})();
*/
