import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// Import needed templates
import '../../ui/main.js';

// Public Routes:

Accounts.onLogout(function() {
	FlowRouter.go('App.home');
});

FlowRouter.route('/', {
  name: 'App.home',
  action() {
    BlazeLayout.render('App_body', { main: 'Home' });
  },
});

FlowRouter.notFound = {
  action() {
    BlazeLayout.render('App_body', { main: 'App_notFound' });
  },
};

// Email Verification
FlowRouter.route('/verify-email/:token',{
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
        FlowRouter.go('App.proposals')
			}
		});
	}
});

FlowRouter.route('/reset-password/:token?', {
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

FlowRouter.route('/login', {
  name: 'App.login',
  action() {
    if (!Meteor.user()){
      BlazeLayout.render('App_body', { main: 'Authenticate' });
    }else{
      BlazeLayout.render('App_body', { main: 'ProposalsList' });
    }
  },
});

FlowRouter.route('/contact', {
  name: 'App.contact',
  action() {
    BlazeLayout.render('App_body', { main: 'contact' });
  },
});

FlowRouter.route('/privacy', {
  name: 'App.privcay',
  action() {
    BlazeLayout.render('App_body', { main: 'Privacy' });
  },
});

FlowRouter.route('/terms', {
  name: 'App.terms',
  action() {
    BlazeLayout.render('App_body', { main: 'Terms' });
  },
});

FlowRouter.route('/about', {
  name: 'App.about',
  action() {
    BlazeLayout.render('App_body', { main: 'About' });
  },
});

//STATISTICS 
FlowRouter.route('/stats', {
  name: 'App.stats',
  action() {
    console.log("show me stats");
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
    console.log("going to stats.proposals");
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
    if (!Meteor.user()){
    FlowRouter.go('App.home');
    Bert.alert(TAPi18n.__('routes.alerts.login-to-view'), 'danger');
  }
  }]
});

loggedInRoutes.route('/profile', {
  name: 'App.profile',
  action() {
    BlazeLayout.render('App_body', { main: 'Profile' });

  },
});

loggedInRoutes.route('/profile/:id', {
  name: 'App.profile',
  action() {
    BlazeLayout.render('App_body', { main: 'Profile' });

  },
});


/*loggedInRoutes.route('/dash', {
  name: 'App.dash',
  action() {
    BlazeLayout.render('App_body', { main: 'Dash' });
  },
});*/

loggedInRoutes.route('/tag/:keyword', {
  name: 'App.tag',
  action() {
    BlazeLayout.render('App_body', {main: 'TagSearch'});
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

loggedInRoutes.route('/proposals/view/:id', {
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

loggedInRoutes.route('/candidate', {
  name: 'App.candidate',
  action() {
    BlazeLayout.render('App_body', { main: 'Candidate' });
  },
});

// Admin Routes:

var adminRoutes = FlowRouter.group({
  prefix: '/admin',
  name: 'admin',
  triggersEnter: [function(context, redirect) {
    if (!Roles.userIsInRole(Meteor.user(), ['admin','superadmin'])){
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