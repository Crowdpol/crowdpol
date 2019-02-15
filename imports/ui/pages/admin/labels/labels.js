import { Labels } from '/imports/api/labels/Labels.js';
import { Meteor } from 'meteor/meteor';
import "./labels.html";
import RavenClient from 'raven-js';

Template.AdminLabelsTable.onCreated(function() {
  var self = this;
  var communityId = LocalStore.get('communityId')
  self.autorun(function() {
    Meteor.subscribe('labels.community', communityId);
  });
  Session.set("labelIndex",-1);
});

Template.AdminLabelsTable.helpers({
  labels: ()=> {
    return Labels.find();
  },
  isApproved: function(){
  	return this.authorized;
  },
  labelDate: function(){
	return moment(this.createdAt).format('DD MMMM YYYY');
  }
});

Template.AdminLabelsTable.events({
	'click .approve-button-class' (event, template){
		event.preventDefault();
    let labelId = event.target.dataset.labelId;
    let authorised = !event.target.dataset.labelAuthorized;
		Meteor.call('toggleAuthorized', labelId,authorised, function(error){
			if (error){
				RavenClient.captureException(error);
				Bert.alert(error.reason, 'danger');
			} else {
				Bert.alert(TAPi18n.__('admin.alerts.label-updated'), 'success');
			}
		});
	},

	'click .delete-button-class': function(event, template){
		event.preventDefault();
		Meteor.call('deleteLabel', event.target.dataset.labelId, function(error){
			if (error){
				RavenClient.captureException(error);
				Bert.alert(error.reason, 'danger');
			} else {
				Bert.alert("Label Deleted", 'success');
			}
		});
	},

});

Template.AdminLabelsForm.events({
	'submit form' (event, template){
		event.preventDefault();
		let text = template.find("#label-text").value;
    var communityId = LocalStore.get('communityId')
    console.log("communityId: " + communityId);
		Meteor.call('addLabel', text, communityId, function(error){
			if (error){
				Bert.alert(error.reason, 'danger');
			} else {
				Bert.alert(TAPi18n.__('admin.alerts.label-added'), 'success');
			}
		});
	},

	'click #delete-button': function(event, template){
		//Meteor.call('deleteLabele', event.target.dataset.userId);
		//Bert.alert(TAPi18n.__('admin.alerts.label-deleted'), 'success');
	},

});
