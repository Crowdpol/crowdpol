import './login.html';
import RavenClient from 'raven-js';

Template.Login.onRendered( function() {
  $( "#login-form" ).validate({
    rules: {
      'login-email': {
        required: true
      },
      'login-password': {
        required: true
      },
    },
    messages: {
      'login-email': {
        required: 'Please enter your email address.'
      },
      'login-password': {
        required: 'Please enter your password.'
      },
    }
  });
});

Template.Login.events({
	'submit #login-form' (event, template){
		event.preventDefault();

		let email = template.find('[name="login-email"]').value;
			password = template.find('[name="login-password"]').value;

		Meteor.loginWithPassword(email, password, (error) => {
			if (error) {
        RavenClient.captureException(error);
				Bert.alert(error.reason, 'danger');
			} else {
        /* Check if subdomain matches user's community */
          var communityId = LocalStore.get('communityId');
          var userCommunities = Meteor.user().profile.communityIds;
          //console.log("communityId:"+communityId);
          //console.log("userCommunities:"+userCommunities);
          /*
          if (!_.contains(userCommunities, communityId)) {
            // log them out and redirect to their community
            Bert.alert(TAPi18n.__('pages.authenticate.individual.login.wrong-community'), 'danger');
            RavenClient.captureException(error);
            Meteor.logout();
            //FlowRouter.go('/login');
          } else {
          */
            var redirect = LocalStore.get('signUpRedirectURL');
            LocalStore.set('signUpRedirectURL', '');
            var user = Meteor.user();
            var userRoles = user.roles;
            //console.log(userRoles);
            if (user && userRoles) {
              if(userRoles.indexOf("delegate") > -1){
                LocalStore.set('isDelegate',true);
              }else{
                LocalStore.set('isDelegate',false);
              }
              if(userRoles.indexOf("individual") > -1){
                //console.log("i am an individual");
                LocalStore.set('currentUserRole','individual');
              }
              if(userRoles.indexOf("organisation") > -1){
                LocalStore.set('currentUserRole','organisation');
              }
              if(userRoles.indexOf("party") > -1){
                LocalStore.set('currentUserRole','party');
              }
              if(userRoles.indexOf("delegate") > -1){
                LocalStore.set('isDelegate',true);
                LocalStore.set('otherRole','delegate');
              }else{
                LocalStore.set('isDelegate',false);
                LocalStore.set('otherRole','');
              }
            //}
            //console.log(LocalStore.get('currentUserRole'));
            //console.log(LocalStore.get('isDelegate'));
            if (Roles.userIsInRole(Meteor.userId(), ['admin'])){
              FlowRouter.go('/admin/dash');
            } else {
              /* Check if redirect route saved */
              if (redirect) {
                window.location.href = redirect;
              } else {
                //console.log("no redirect sent with signup, redirecting to /dash");
                FlowRouter.go('/');
              }
            }
          }
			}
		});
	}
});
