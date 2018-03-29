import './dash.html';
import RavenClient from 'raven-js'

Template.Dash.helpers({
	isUnapprovedEntity: ()=> {
		if ((Roles.userIsInRole(Meteor.userId(), ['organisation-delegate', 'party-delegate'])) && 
			(!Meteor.call('isApproved', Meteor.userId()))) {
			return true;
		} else {
			return false;
		}
	}
});

Template.Dash.events({
	'click .resend-verification-link' (event, template){
		Meteor.call('sendVerificationLink', (error, response) => {
			if (error){
				RavenClient.captureException(error);
				Bert.alert(error.reason, 'danger');
			} else {
				let email = Meteor.user().emails[0].address;
				message = TAPi18n.__('pages.dashboard.alerts.verification-email-sent',{email: email});
				Bert.alert(message, 'success');
			}
		});
	},

	'click #log-out' (event, template){
		event.preventDefault();
		Meteor.logout();
	},
	'click #log-in' (event, template){
		FlowRouter.go('/login');
	}
});