import { Tags } from '/imports/api/tags/Tags.js';
import { Meteor } from 'meteor/meteor';
import "./tags.html";

Template.AdminTagsTable.onCreated(function() {
  var self = this;
  self.autorun(function() {
    Meteor.subscribe('tags.all');
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
  tagIndex: function(){
  	 console.log(this);
      return 0;
    },
});

Template.AdminTagsTable.events({
	'click #approve-button' (event, template){
		event.preventDefault();
		console.log(event.target.dataset.userId);
		//Meteor.call('user.delete', event.target.dataset.userId);
		/*
		Meteor.call('addTag', text, function(error){
			if (error){
				Bert.alert(error.reason, 'danger');
			} else {
				Bert.alert('Tag added', 'success');
			}
		});
		*/
	},

	'click #delete-button': function(event, template){
		//Meteor.call('deleteTage', event.target.dataset.userId);
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
				Bert.alert('Tag added', 'success');
			}
		});
	},

	'click #delete-button': function(event, template){
		//Meteor.call('deleteTage', event.target.dataset.userId);
	},

});
