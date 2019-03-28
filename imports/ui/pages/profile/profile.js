import "./profileForm.js"
import "./resetPassword"
import "./profile.html"
import "./profile.css"
import { walkThrough } from '../../../utils/functions';
import { getUserIdByUsername } from '../../../utils/users';

Template.Profile.onCreated(function() {
  var self = this;
  Session.set('showSettings',Meteor.user().isPublic);
});

Template.Profile.events({
	'click #profile-help'(event, template){
		var steps = [
			{
				element: document.querySelector('#profile-radios'),
				intro: "Make your full profile visible to others.",
				position: 'top'
			},
			{
				element: '#progress-container',
				intro: "See how far your profile is from complete.",
				position: 'top'
			},
			{
				element: '#delegate-switch-container',
				intro: 'Make yourself available for vote delegation, (i.e. vote on behalf of others.)',
				position: 'top'
			},
			{
				element: '#password-reset-form',
				intro: 'Reset your login password.',
				position: 'top'
			}
		];
		walkThrough(steps);
	}
});

Template.Profile.helpers({
  isOwner: function(){
    console.log(getUsername());
    return true;
  },
  showSettings: function(){
    return Session.get('showSettings');
  }
});

function getUsername(){
  let username = FlowRouter.getParam("id");
  console.log(username);
  if(typeof username !='undefined'){
    if(username.charAt(0)=='@'){
      username=username.slice(1);
    }
    console.log('username: ' + username);
    user = Meteor.users.find({"profile.username" :username});
    console.log(Meteor.users.findOne({"profile.username" :username}));
    console.log(user);
    //user = getUserIdByUsername(username);
    //console.log(user);
    /* CONSIDER DELETING
    user = Meteor.users.findOne({"_id":userId});
    if(typeof user != 'undefined'){
      let profile = user.profile;
      if(typeof profile.coverURL == 'undefined'){
        console.log("cover undefined, leave blank");
      }else{
        console.log("coverURL found");
      }
    }*/
  }else{
    console.log("username is undefined");
  }
  //console.log("ownerId: " + userId);
  return username;
}
