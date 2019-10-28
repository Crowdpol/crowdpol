import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { setCommunityToRoot } from '../../utils/community.js';

// Import needed templates
import '../../ui/main.js';

// Global onEnter trigger to save communityInfo in LocalStore
//FlowRouter.triggers.enter([loadCommunityInfo]);

// the App_notFound template is used for unknown routes and missing lists
FlowRouter.notFound = {
  action() {
    BlazeLayout.render('App_body', {main: 'App_notFound'});
  }
};

// Public Routes (no need to log in):

var publicRoutes = FlowRouter.group({name: 'public'});

Accounts.onLogout(function() {
  console.log("routes: set community to root");
  //setCommunityToRoot();
	BlazeLayout.render('App_body', { main: 'Home' });
});

publicRoutes.route('/', {
  name: 'App.home',
  action() {
    let subdomain = LocalStore.get('subdomain');
    if(subdomain=='landing'){
      BlazeLayout.render('App_body', { main: 'Landing' });
    }else{
      if (!Meteor.user()){
        BlazeLayout.render('App_body', { main: 'Home' });
      }else{
        BlazeLayout.render('App_body', { main: 'CommunityDash' });
      }
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
      BlazeLayout.render('App_body', { main: 'Dash' });
    }
  },
});
publicRoutes.route('/signup', {
  name: 'App.login',
  action() {
    if (!Meteor.user()){
      BlazeLayout.render('App_body', { main: 'Authenticate' });
    }else{
      BlazeLayout.render('App_body', { main: 'Dash' });
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

publicRoutes.route('/amchart', {
  name: 'App.amchart',
  action() {
    BlazeLayout.render('App_body', { main: 'AmChart' });
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

publicRoutes.route('/leaflet', {
  name: 'App.leaflet',
  action() {
    BlazeLayout.render('App_body', { main: 'Leaflet' });
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
    let user = Meteor.user();
    if (user){
      //console.log("have found signed in user");
      if(typeof user.profile !== 'undefined'){
        let profile = user.profile;
        if(typeof profile.settings !== 'undefined'){
          if(!_.contains(Meteor.user().profile.communityIds, LocalStore.get('communityId'))){
            FlowRouter.go('App.home');
      	    Bert.alert(TAPi18n.__('pages.routes.alerts.login-to-view'), 'danger');
          }else{
            //console.log("user community does not match current community");
          }
        }else{
          //console.log("user profile has no settings");
        }
      }else{
        //console.log("user has no profile");
      }
  	}else{
      BlazeLayout.render('App_body', { main: 'Home' });
    }
  }]
});

publicRoutes.route('/wizard', {
  name: 'App.wizard',
  action() {
    BlazeLayout.render('App_body', { main: 'Wizard' });
  },
});

publicRoutes.route('/compass', {
  name: 'App.compass',
  action() {
    BlazeLayout.render('App_body', { main: 'Compass' });
  },
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
loggedInRoutes.route('/group/:handle?', {
  name: 'App.group',
  action() {
    BlazeLayout.render('App_body', { main: 'Group' });
  },
});

loggedInRoutes.route('/feed', {
  name: 'App.feed',
  action() {
    BlazeLayout.render('App_body', { main: 'UserFeed' });
  },
});

loggedInRoutes.route('/feed/:id', {
  name: 'App.feed',
  action() {
    BlazeLayout.render('App_body', { main: 'UserFeed' });
  },
});


loggedInRoutes.route('/dash', {
  name: 'App.dash',
  action() {
    //console.log("/dash route called");
    if (Meteor.user()){
      BlazeLayout.render('App_body', { main: 'CommunityDash' });
      //console.log("/dash points to community dash");
    }else{
      BlazeLayout.render('App_body', { main: 'App_notFound' });
      //console.log("/dash points to app not found");
    }
  },
});

loggedInRoutes.route('/dash/vote', {
  name: 'App.dash',
  action() {
    //console.log("/dash route called");
    if (Meteor.user()){
      BlazeLayout.render('App_body', { main: 'CommunityDash' });
      //console.log("/dash points to community dash");
    }else{
      BlazeLayout.render('App_body', { main: 'App_notFound' });
      //console.log("/dash points to app not found");
    }
  },
});
loggedInRoutes.route('/dash/proposals', {
  name: 'App.dash',
  action() {
    //console.log("/dash route called");
    if (Meteor.user()){
      BlazeLayout.render('App_body', { main: 'CommunityDash' });
      //console.log("/dash points to community dash");
    }else{
      BlazeLayout.render('App_body', { main: 'App_notFound' });
      //console.log("/dash points to app not found");
    }
  },
});

loggedInRoutes.route('/dash/delegates', {
  name: 'App.dash',
  action() {
    //console.log("/dash route called");
    if (Meteor.user()){
      BlazeLayout.render('App_body', { main: 'CommunityDash' });
      //console.log("/dash points to community dash");
    }else{
      BlazeLayout.render('App_body', { main: 'App_notFound' });
      //console.log("/dash points to app not found");
    }
  },
});
loggedInRoutes.route('/dash/members', {
  name: 'App.dash',
  action() {
    //console.log("/dash route called");
    if (Meteor.user()){
      BlazeLayout.render('App_body', { main: 'CommunityDash' });
      //console.log("/dash points to community dash");
    }else{
      BlazeLayout.render('App_body', { main: 'App_notFound' });
      //console.log("/dash points to app not found");
    }
  },
});
loggedInRoutes.route('/dash/groups', {
  name: 'App.dash',
  action() {
    //console.log("/dash route called");
    if (Meteor.user()){
      BlazeLayout.render('App_body', { main: 'CommunityDash' });
      //console.log("/dash points to community dash");
    }else{
      BlazeLayout.render('App_body', { main: 'App_notFound' });
      //console.log("/dash points to app not found");
    }
  },
});
loggedInRoutes.route('/dash/communities', {
  name: 'App.dash',
  action() {
    //console.log("/dash route called");
    if (Meteor.user()){
      BlazeLayout.render('App_body', { main: 'CommunityDash' });
      //console.log("/dash points to community dash");
    }else{
      BlazeLayout.render('App_body', { main: 'App_notFound' });
      //console.log("/dash points to app not found");
    }
  },
});
loggedInRoutes.route('/dash/feed', {
  name: 'App.dash',
  action() {
    //console.log("/dash route called");
    if (Meteor.user()){
      BlazeLayout.render('App_body', { main: 'CommunityDash' });
      //console.log("/dash points to community dash");
    }else{
      BlazeLayout.render('App_body', { main: 'App_notFound' });
      //console.log("/dash points to app not found");
    }
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

loggedInRoutes.route('/proposals/view/:id?', {
  name: 'App.proposal.view',
  action() {
    BlazeLayout.render('App_body', {main: 'ViewProposal'});
  }
});

/* Users without an account can see individual proposals */


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


/*
(function() {
    var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = 'http://www.stackoverflow.com/favicon.ico';
    document.getElementsByTagName('head')[0].appendChild(link);
})();
*/
