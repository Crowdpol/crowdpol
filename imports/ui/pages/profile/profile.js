import "./profileImage.js"
import "./profileForm.js"
import "./resetPassword"
import "./profile.html"
import "./profile.css"
import { walkThrough } from '../../../utils/functions';

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
  showSettings: function(){
    return Session.get('showSettings');
  }
});
