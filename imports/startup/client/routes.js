import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { setCommunityToRoot } from '../../utils/community.js';

// Import needed templates
import '../../ui/main.js';


/*----------------------------------------------------------------------------*/
/*                       FlowRouter Basics
/*----------------------------------------------------------------------------*/
// Global onEnter trigger to save communityInfo in LocalStore
//FlowRouter.triggers.enter([loadCommunityInfo]);

FlowRouter.notFound = {
  action() {
    BlazeLayout.render('App_body', {main: 'App_notFound'});
  }
};

Accounts.onLogout(function() {
  console.log("routes: set community to root");
  //setCommunityToRoot();
	BlazeLayout.render('App_body', { main: 'Landing' });
});

/*----------------------------------------------------------------------------*/
/*                       Public Pages (Not signed in)
/*----------------------------------------------------------------------------*/

var publicRoutes = FlowRouter.group({name: 'public'});

publicRoutes.route('/', {
  name: 'App.home',
  action() {
    if(!Session.get("bulletproof")){
      console.log("rendering holding");
        BlazeLayout.render('Holding');
    }else{
      if (!Meteor.user()){
        console.log("rendering landing");
        //BlazeLayout.render('App_body', { main: 'Home' });
        BlazeLayout.render('Landing');
      }else{
        console.log("rendering navigator");
        BlazeLayout.render('App_body', { main: 'navigator' });
      }
    }
  }
});

/*----------------------- Authentication -------------------------------------*/

publicRoutes.route('/login', {
  name: 'App.login',
  action() {
    if(!Session.get("bulletproof")){
      console.log("rendering holding");
        BlazeLayout.render('Holding');
    }else{
      if (!Meteor.user()){
        BlazeLayout.render('App_body', { main: 'Authenticate' });
      }else{
        FlowRouter.go('/navigator');
      }
    }
  },
});

publicRoutes.route('/logout', {
  name: 'App.logout',
  action() {
    if (!Meteor.user()){
      BlazeLayout.render('App_body', { main: 'Logout' });
    }else{
      FlowRouter.go('/landing');
    }
  },
});

publicRoutes.route('/signup', {
  name: 'App.signup',
  action() {
    if(!Session.get("bulletproof")){
      console.log("rendering holding");
        BlazeLayout.render('Holding');
    }else{
      BlazeLayout.render('App_body', { main: 'RegistrationWizard' });
    }
  },
});

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

/*-------------------------- Not Found ---------------------------------------*/

// Static Pages
publicRoutes.notFound = {
  action() {
    BlazeLayout.render('App_body', { main: 'App_notFound' });
  },
};


// the App_notFound template is used for unknown routes and missing lists
publicRoutes.route('/not-found', {
  name: 'App.not-found',
  action() {
    BlazeLayout.render('App_body', { main: 'App_notFound' });
  },
});

/*-------------------------- Public Pages ------------------------------------*/

publicRoutes.route('/landing', {
  name: 'App.home',
  action() {
    if(!Session.get("bulletproof")){
      console.log("rendering holding");
        BlazeLayout.render('Holding');
    }else{
        BlazeLayout.render('Landing');
    }
  }
});

publicRoutes.route('/faq', {
  name: 'App.faq',
  action() {
    BlazeLayout.render('App_body', { main: 'FAQ' });
  },
});

publicRoutes.route('/contact', {
  name: 'App.contact',
  action() {
    BlazeLayout.render('App_body', { main: 'contact' });
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

/*-------------------------- Developer Pages ---------------------------------*/
// Test Pages - i.e. not completed or used for dev...

publicRoutes.route('/style', {
  name: 'App.style',
  action() {
    BlazeLayout.render('App_body', { main: 'Style' });
  }
});

publicRoutes.route('/amchart', {
  name: 'App.amchart',
  action() {
    BlazeLayout.render('App_body', { main: 'AmChart' });
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
    console.log("render test");
    BlazeLayout.render('App_body', { main: 'Test' });
  },
});

publicRoutes.route('/leaflet', {
  name: 'App.leaflet',
  action() {
    BlazeLayout.render('App_body', { main: 'Leaflet' });
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

/*-------------------------- Developer Pages ---------------------------------*/
/*
//USER SEARCH
FlowRouter.route('/search/users', {
  name: 'App.search.users',
  action() {
    BlazeLayout.render('App_body', { main: 'UserSearch' });
  },
});
*/

/*----------------------------------------------------------------------------*/
/*                       Public Pages (Not signed in)
/*----------------------------------------------------------------------------*/

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

/*----------------------Global Layout Pages ---------------------------------*/

//this is the new layout stripped of any content
loggedInRoutes.route('/global', {
  name: 'App.global',
  action() {
    BlazeLayout.render('App_body', { main: 'Global', content: {
      id: "generic",
      cover: "Generic_Cover",
      menu: "Generic_Menubar",
      body: "Generic_Body",
      footer: "Generic_Footer"
    }});
  },
});

//the main dashboard from which users navigate
loggedInRoutes.route('/navigator', {
  name: 'App.navigator',
  action() {
    BlazeLayout.render('App_body', { main: 'Global', content: {
      class: "navigagtor",
      cover: "Navigator_Cover",
      menu: "Navigator_Menubar",
      body: "Navigator_Body",
      footer: "Navigator_Footer"
    }});
  },
});

//based on the navigator, displays user search results
loggedInRoutes.route('/search', {
  name: 'App.search',
  action() {
    BlazeLayout.render('App_body', { main: 'Global', content: {
      class: "search",
      cover: "Search_Cover",
      menu: "Search_Menubar",
      body: "Search_Body",
      footer: "Search_Footer"
    }});
  },
});
loggedInRoutes.route('/search/:id', {
  name: 'App.search_id',
  action() {
    BlazeLayout.render('App_body', { main: 'Global', content: {
      class: "search",
      cover: "Search_Cover",
      menu: "Search_Menubar",
      body: "Search_Body",
      footer: "Search_Footer"
    }});
  },
});

//proposal related
loggedInRoutes.route('/newproposal/:id', {
  name: 'App.newproposal',
  action() {
    BlazeLayout.render('App_body', { main: 'NewViewProposal'});
  },
});

//user accounted related
loggedInRoutes.route('/presence', {
  name: 'App.presence',
  action() {
    BlazeLayout.render('App_body', { main: 'Global', content: {
      class: "presence",
      cover: "Presence_Cover",
      menu: "Presence_Menubar",
      body: "Presence_Body",
      footer: "Presence_Footer"
    }});
  },
});

loggedInRoutes.route('/presence/:id', {
  name: 'App.presence_id',
  action() {
    BlazeLayout.render('App_body', { main: 'Global', content: {
      class: "presence",
      cover: "Presence_Cover",
      menu: "Presence_Menubar",
      body: "Presence_Body",
      footer: "Presence_Footer"
    }});
  },
});

loggedInRoutes.route('/profile', {
  name: 'App.profile',
  action() {
    BlazeLayout.render('App_body', { main: 'Global', content: {
      class: "profile",
      cover: "Profile_Cover",
      menu: "Profile_Menubar",
      body: "Profile_Body",
      footer: "Profile_Footer"
    }});
  },
});

//group related
//TO DO: Add Group Global Presence



/*------------------User Account Related Pages -------------------------------*/

//Registration Wizard
loggedInRoutes.route('/wizard', {
  name: 'App.wizard',
  action() {
    BlazeLayout.render('App_body', { main: 'Wizard' });
  },
});
loggedInRoutes.route('/wizard/step/:id', {
name: 'App.wizard',
action() {
  BlazeLayout.render('App_body', { main: 'Wizard' });
},
});



/*---------- Old Pages (Consider Deleting, or applying Global Layout) --------*/
/*
//User Compass
publicRoutes.route('/compass', {
  name: 'App.compass',
  action() {
    BlazeLayout.render('App_body', { main: 'Compass' });
  },
});
//User Profile
loggedInRoutes.route('/profileold', {
  name: 'App.profileold',
  action() {
    BlazeLayout.render('App_body', { main: 'ProfileSettings' });
  },
});

loggedInRoutes.route('/group/:handle?', {
  name: 'App.group',
  action() {
    BlazeLayout.render('App_body', { main: 'Group' });
  },
});

loggedInRoutes.route('/feed', {
  name: 'App.feed',
  action() {
    BlazeLayout.render('App_body', { main: 'Global', content: {
      class: "presence",
      cover: "Presence_Cover",
      menu: "Presence_Menubar",
      body: "Presence_Body",
      footer: "Presence_Footer"
    }});
  },
});

loggedInRoutes.route('/feed/:id', {
  name: 'App.feed',
  action() {
    BlazeLayout.render('App_body', { main: 'Global', content: {
      class: "presence",
      cover: "Presence_Cover",
      menu: "Presence_Menubar",
      body: "Presence_Body",
      footer: "Presence_Footer"
    }});
  },
});

loggedInRoutes.route('/presence', {
  name: 'App.presence',
  action() {
    BlazeLayout.render('Test', {
      left: 'PresenceLeft',
      main: 'PresenceContent',
      left: 'PresenceRight'
    });
  },
});

loggedInRoutes.route('/presence/:id', {
  name: 'App.presence',
  action() {
    BlazeLayout.render('App_body', { main: 'UserPresence' });
  },
});






loggedInRoutes.route('/dash', {
  name: 'App.dash',
  action() {
    //console.log("/dash route called");
    if (Meteor.user()){
      BlazeLayout.render('App_body', { main: 'Navigator' });
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
      BlazeLayout.render('App_body', { main: 'Navigator' });
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
      BlazeLayout.render('App_body', { main: 'Navigator' });
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
      BlazeLayout.render('App_body', { main: 'Navigator' });
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
      BlazeLayout.render('App_body', { main: 'Navigator' });
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
      BlazeLayout.render('App_body', { main: 'Navigator' });
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
      BlazeLayout.render('App_body', { main: 'Navigator' });
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
      BlazeLayout.render('App_body', { main: 'Navigator' });
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
    BlazeLayout.render('App_body', {main: 'NewViewProposal'});
  }
});

loggedInRoutes.route('/delegate', {
  name: 'App.delegate',
  action() {
    BlazeLayout.render('App_body', { main: 'Delegate' });
  },
});

loggedInRoutes.route('/notifications', {
  name: 'App.notifications',
  action() {
    BlazeLayout.render('App_body', { main: 'Notifications' });
  },
});

loggedInRoutes.route('/settings', {
  name: 'App.account-settings',
  action() {
    BlazeLayout.render('App_body', { main: 'AccountSettings' });
  },
});
*/

/*----------------------------------------------------------------------------*/
/*                       Admin Pages
/*----------------------------------------------------------------------------*/

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
