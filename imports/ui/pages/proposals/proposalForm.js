import './proposalForm.html'
import Quill from 'quill'
import { Proposals } from '../../../api/proposals/Proposals.js'
import { Communities } from '../../../api/communities/Communities.js'
//import { setupTaggle } from '../../components/taggle/taggle.js'
import { getTags } from '../../components/taggle/taggle.js'
import "../../components/userSearch/userSearch.js"
import "../../components/arguments/arguments.js"
import RavenClient from 'raven-js';
import { Random } from 'meteor/random';

Template.ProposalForm.onCreated(function(){
	var self = this;
	self.pointsFor = new ReactiveVar([]);
	self.pointsAgainst = new ReactiveVar([]);
	self.argumentsFor = new ReactiveVar([]);
	self.argumentsAgainst = new ReactiveVar([]);
});

Template.ProposalForm.onRendered(function(){
	var self = this;

	var allContent = self.data.content;
	if(typeof allContent==='undefined'){
		//console.log("here is your problem");
		Bert.alert("Could not find proposals",'danger');
	}
	var language = self.data.language;
	let argumentsArray = [];
	var content = _.find(allContent, function(item){
		//argumentsArray.push(item.argumentsFor);
		//argumentsArray.push(item.argumentsAgainst);
	 	return item.language == language
	});
	//Session.set('arguments',argumentsArray);
	//console.log("Checking session");
	//console.log(Session.get('arguments'));
	// Initialise Quill editor
	var editor = new Quill(`#body-editor-${language}`, {
		modules: {
			toolbar: [
			['bold', 'italic', 'underline'],
			['image', 'blockquote', 'link']
			]
		},
		theme: 'snow'
	});
	// Copy quill editor's contents to hidden input for validation
	editor.on('text-change', function (delta, source) {
  		var bodyText = self.find('.ql-editor').innerHTML;
  		self.find(`#body-${language}`).value = bodyText;
  	});

	// Working on an existing proposal
	if (content) {
		// Set points for and against
		if (content.pointsFor != null){
			self.pointsFor.set(content.pointsFor);
		}
		if (content.pointsAgainst != null){
			self.pointsAgainst.set(content.pointsAgainst);
		}
		/*
		if (content.argumentsFor != null){
			argumentsArray.push(content.argumentsFor);
			//self.argumentsFor.set(content.argumentsFor);
		}
		if (content.argumentsAgainst != null){
			argumentsArray.push(content.argumentsFor);
			//self.argumentsAgainst.set(content.argumentsAgainst);
		}
		*/

		// Initialise content fields
		self.find(`#title-${language}`).value = content.title || '';
		self.find(`#abstract-${language}`).value = content.abstract || '';
		self.find(`#body-${language}`).value = content.body || '';
		self.find('.ql-editor').innerHTML = content.body || '';
	}
	// Set session so parent template can initialise form validation
	Session.set("formRendered", true);
});

Template.ProposalForm.events({
	'click .add-argument-against-button .add-argument-against-icon': function(event, template){
		event.preventDefault();
		let argumentType = event.currentTarget.getAttribute('data-type');
		//let argumentTextIdentifier = $("#argument-message-against").val();
		//console.log($("#argument-against-message").val());
		let argument = {
			_id: Random.id(),
      type: argumentType,
      message: $("#argument-for-message").val(),
      authorId: Meteor.user()._id,
      upVote: [],
      downVote: []
    }
		let argumentsFor = Template.instance().argumentsFor.get();
		argumentsFor.push(argument);
		Template.instance().argumentsFor.set(argumentsFor);
	},

	'click #add-argument-against-button, #add-argument-against-icon': function(event, template){
		event.preventDefault();
		let argument = {
			_id: Random.id(),
      type: 'against',
      message: $("#argument-againt-message").val(),
      authorId: Meteor.user()._id,
      upVote: [],
      downVote: []
    }
		let argumentsAgainst = Template.instance().argumentsAgainst.get();
		argumentsAgainst.push(argument);
		Template.instance().argumentsAgainst.set(argumentsAgainst);
	},

	'click .add-point-for': function(event, template){
		event.preventDefault();
		var lang = event.target.dataset.lang;
		var instance = Template.instance();
		var pointsFor = instance.pointsFor.get();
		var point = template.find(`#inputPointFor-${lang}`).value;
		var index = pointsFor.indexOf(point);
		if(index > -1){
			var listItemId = "#point-for-" + index;
			$(listItemId).fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
		}else{
			pointsFor.push(point);
			instance.pointsFor.set(pointsFor);
			template.find(`#inputPointFor-${lang}`).value = "";
			template.find("#pointsForWrap").MaterialTextfield.change()
		}
	},
	'click .add-point-against': function(event, template){
		event.preventDefault();
		var lang = event.target.dataset.lang;
		var instance = Template.instance();
		var pointsAgainst = instance.pointsAgainst.get();
		var point = template.find(`#inputPointAgainst-${lang}`).value;
		var index = pointsAgainst.indexOf(point);
		if(index > -1){
			var listItemId = "#point-against-" + index;
			$(listItemId).fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
		}else{
			pointsAgainst.push(point);
			instance.pointsAgainst.set(pointsAgainst);
			template.find(`#inputPointAgainst-${lang}`).value = "";
			template.find("#pointsAgainstWrap").MaterialTextfield.change()
		}
	},
	'click #remove-point-for': function(event, template){
		event.preventDefault();
		var instance = Template.instance();
		var index = event.currentTarget.getAttribute('data-id');
		var tempArray = instance.pointsFor.get();
		tempArray.splice(index, 1);
		instance.pointsFor.set(tempArray);
	},
	'click #remove-point-against': function(event, template){
		event.preventDefault();
		var instance = Template.instance();
		var index = event.currentTarget.getAttribute('data-id');
		var tempArray = instance.pointsAgainst.get();
		tempArray.splice(index, 1);
		instance.pointsAgainst.set(tempArray);
	},
	'mouseenter .pointsListItem':  function(event, template){
		string = "#" + event.currentTarget.id + " > button";
		$(string).show();
	},
	'mouseleave  .pointsListItem':  function(event, template){
		string = "#" + event.currentTarget.id + " > button";
		$(string).hide();
	},
	'input textarea, input input' : function( event , template){
		//autosave(event, template);
	},
});

Template.ProposalForm.helpers({

	pointsFor() {
		return Template.instance().pointsFor.get();
	},
	pointsAgainst() {
		return Template.instance().pointsAgainst.get();
	},
	forArguments() {
		//console.log("forArguments called");

		let lang = this.language;
		let argumentsArray = Session.get('arguments');
		let forArguments = [];
		argumentsArray.forEach(function (argument, index) {
			if(argument.type=='for'&&argument.language==lang){
				forArguments.push(argument);
			}
		});
		return forArguments;
	},
	againstArguments() {
		let lang = this.language;
		let argumentsArray = Session.get('arguments');
		let againstArguments = [];
		argumentsArray.forEach(function (argument, index) {
			if(argument.type=='against'&&argument.language==lang){
		  	againstArguments.push(argument);
			}
		});
		return againstArguments;
	}
});

export function validateForm(){
	// Form Validations
	$( "#edit-proposal-form" ).validate({
		debug: true,
		ignore: "",
		rules: {
			title: {
				required: false,
				minlength: 5
			},
			abstract: {
				required: false,
				minlength: 5
			},
			body: {
				required: false,
				minlength: 50
			},
			startDate: {
				required: true,
			},
			endDate: {
				required: true,
			},
			inputPointFor: {
				required: false,
				minlength: 1,
				maxlength: 320
			},
			inputPointAgainst: {
				required: false,
				minlength: 1,
				maxlength: 320
			}
		},
		messages: {
			title: {
				required: 'Please make sure your proposal has a title.',
				minlength: "Use at least 5 characters."
			},
			abstract: {
				required: 'Please provide a short abstract for your proposal.',
				minlength: "Use at least 5 characters."
			},
			body: {
				body: 'Please provide a body for your proposal.',
				minlength: "Use at least 50 characters."
			},
			startDate: {
				required: 'Please indicate when voting will open for this proposal.'
			},
			endDate: {
				required: 'Please indicate when voting will close for this proposal.'
			},
		}
	});
}
