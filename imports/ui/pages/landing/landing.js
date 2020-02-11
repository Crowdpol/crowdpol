import './landing.html';
import RavenClient from 'raven-js'
//import './landing_files/app.js" type="text/javascript"></script>
//import './landing.scss';
Template.Landing.onRendered(function() {
  $(window).on('resize', function(){
    $("#viewport-size").text($(window).height() + "x" + $(window).width());
  });
});

Template.Landing.events({
  'click .menu-scroll-link, click .header-button': function(event, template){
    event.preventDefault();
    console.log($(this).hasClass( "active" ));
    let anchorId = event.currentTarget.dataset.anchor;
    scrollTo(anchorId);
  },
  'click .recent-stories-right': function(event,template){
    $('.recent-stories-scroller').animate({
          right: '200px'
      });
  },
  'click .signup-button': function(event, template){
    event.preventDefault();
		var communityId = LocalStore.get('communityId');
		var email = template.find('[name="signup-email"]').value;
    let user = {
      email: email,
      password: template.find('[name="signup-password"]').value,
      profile: {communityIds: ['global'], termsAccepted: true}
    };
    //check if the user email already has an account
    if(checkUserExists(email,communityId)){
      //console.log("checked user exists, redirecting to /dash");
      //FlowRouter.go('/dash');
    }else{
      Accounts.createUser(user, (error) => {
        if (error) {
          RavenClient.captureException(error);
          Bert.alert(error.reason, 'danger');
        } else {
          /* Check if redirect route saved */
          var redirect = LocalStore.get('signUpRedirectURL');
          LocalStore.set('signUpRedirectURL', '');
          if (redirect){
            window.location.href = redirect;
          } else {
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
            }
            //console.log(LocalStore.get('currentUserRole'));
            //console.log(LocalStore.get('isDelegate'));
            //console.log("user created, redirecting to /dash");
            FlowRouter.go('/signup');
          }

            /*Meteor.call('sendVerificationLink', (error, response) => {
              if (error){
                Bert.alert(error.reason, 'danger');
              } else {
                Bert.alert(TAPi18n.__('generic.alerts.welcome'), 'success');
              }
            });*/
        }
      });
    }
  }
});


function scrollTo(elementId){
  $('html, body').animate({
    scrollTop: $(elementId).offset().top
  }, 800);
}

Template.Landing.helpers({
	viewportSize: function(){
		return $(window).height() + "x" + $(window).width();
	},
  previewProposals: function(){
    let testProposals = [
      {
        _id: 1,
        title: "Test Propsal 1",
        coverURL: "url('https://source.unsplash.com/random/800x600')",
        abstract: "This is an abstract for Test Proposal 1",
        yes: 10,
        abstain: 30,
        no: 60,
        votecount: 82680,
        viewcount: 756902
      },
      {
        _id: 2,
        title: "Test Propsal 2",
        coverURL: "url('https://source.unsplash.com/random/800x600')",
        abstract: "This is an abstract for Test Proposal 2",
        yes: 70,
        abstain: 5,
        no: 25,
        votecount: 7422,
        viewcount: 10023
      },
      {
        _id: 3,
        title: "Test Propsal 3",
        coverURL: "url('https://source.unsplash.com/random/800x600')",
        abstract: "This is an abstract for Test Proposal 3",
        yes: 35,
        abstain: 35,
        no: 30,
        votecount: 153,
        viewcount: 24981
      },
      {
        _id: 4,
        title: "Test Propsal 4",
        coverURL: "url('https://source.unsplash.com/random/800x600')",
        abstract: "This is an abstract for Test Proposal 4",
        yes: 90,
        abstain: 5,
        no: 5,
        votecount: 832,
        viewcount: 526
      },{
        _id: 5,
        title: "Test Propsal 5",
        coverURL: "url('https://source.unsplash.com/random/800x600')",
        abstract: "This is an abstract for Test Proposal 5",
        yes: 70,
        abstain: 10,
        no: 30,
        votecount: 6064,
        viewcount: 6802
      }
    ];
    return testProposals;
  }
});

function checkUserExists(email,communityId){
	Meteor.call('checkIfUserExists',email,communityId, (error, response) => {
		if (error){
			//user email not found, create a new account
			Bert.alert(error.reason, 'danger');
			return false;
		} else {
			//user email found, adding community to user profile
			//Bert.alert("found email", 'success');
			return true;
		}
	});
	return false;
}
