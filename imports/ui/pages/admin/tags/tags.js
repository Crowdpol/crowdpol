import { Tags } from '/imports/api/tags/Tags.js';
import { Meteor } from 'meteor/meteor';
import "./tags.html";
import RavenClient from 'raven-js';

Template.AdminTagsTable.onCreated(function() {
  var self = this;
  var communityId = LocalStore.get('communityId')
  self.autorun(function() {
    Meteor.subscribe('tags.community', communityId);
  });
  Session.set("tagIndex",-1);
});

Template.AdminTagsTable.helpers({
  tags: ()=> {
    return Tags.find();
  },
  isApproved: function(){
  	return this.authorized;
  },
  tagDate: function(){
	return moment(this.createdAt).format('DD MMMM YYYY');
  }
});

Template.AdminTagsTable.events({
	'click .approve-button-class' (event, template){
		event.preventDefault();
    let tagId = event.target.dataset.tagId;
    let authorised = !event.target.dataset.tagAuthorized;
		Meteor.call('toggleAuthorized', tagId,authorised, function(error){
			if (error){
				RavenClient.captureException(error);
				Bert.alert(error.reason, 'danger');
			} else {
				Bert.alert(TAPi18n.__('pages.admin.alerts.tag-updated'), 'success');
			}
		});
	},

	'click .delete-button-class': function(event, template){
		event.preventDefault();
		Meteor.call('deleteTag', event.target.dataset.tagId, function(error){
			if (error){
				RavenClient.captureException(error);
				Bert.alert(error.reason, 'danger');
			} else {
				Bert.alert("Tag Deleted", 'success');
			}
		});
	},

});

Template.AdminTagsForm.events({
	'submit form' (event, template){
		event.preventDefault();
		let text = template.find("#tag-text").value;

		Meteor.call('addTag', text, function(error){
			if (error){
				Bert.alert(error.reason, 'danger');
			} else {
				Bert.alert(TAPi18n.__('pages.admin.alerts.tag-added'), 'success');
			}
		});
	},

	'click #delete-button': function(event, template){
		//Meteor.call('deleteTage', event.target.dataset.userId);
		//Bert.alert(TAPi18n.__('pages.admin.alerts.tag-deleted'), 'success');
	},

});
