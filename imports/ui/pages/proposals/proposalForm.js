import './proposalForm.html'
import Quill from 'quill'
import { Proposals } from '../../../api/proposals/Proposals.js'
import { Comments } from '../../../api/comments/Comments.js'
import { Communities } from '../../../api/communities/Communities.js'
//import { setupTaggle } from '../../components/taggle/taggle.js'
import { getTags } from '../../components/taggle/taggle.js'
import "../../components/userSearch/userSearch.js"
import "../../components/arguments/arguments.js"
import {autosave} from './editProposal.js'
import RavenClient from 'raven-js';
import { Random } from 'meteor/random';

Template.ProposalForm.onCreated(function(){
	var self = this;
	self.argumentsFor = new ReactiveVar([]);
	self.argumentsAgainst = new ReactiveVar([]);
	self.autorun(function() {
		let proposalId = FlowRouter.getParam("id");
		self.subscribe('comments', proposalId);
	});
	var dict = new ReactiveDict();

	var langs = LocalStore.get('languages');
	langs.forEach(function(language) {
		let dictId = "abstract-" + language + "-Count";
		dict.set( dictId, 0);
	});
	self.dict = dict;
});

Template.ProposalForm.onRendered(function(){
	var self = this;

	var allContent = self.data.content;
	if(typeof allContent==='undefined'){
		Bert.alert("Could not find proposals",'danger');
	}
	var language = self.data.language;
	let argumentsArray = [];
	var content = _.find(allContent, function(item){
	 	return item.language == language
	});

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
			//console.log("quill text change");
  		var bodyText = self.find('.ql-editor').innerHTML;
  		self.find(`#body-${language}`).value = bodyText;
			autosave(this,self);
  	});

	// Working on an existing proposal
	if (content) {
		// Set points for and against

		// Initialise content fields
		self.find(`#title-${language}`).value = content.title || '';
		self.find(`#abstract-${language}`).value = content.abstract || '';
		self.find(`#body-${language}`).value = content.body || '';
		self.find('.ql-editor').innerHTML = content.body || '';
		var langs = LocalStore.get('languages');
		let abstract = content.abstract || '';
		let dictId = "abstract-" + language + "-Count";
		console.log("abstract.length: "+ abstract.length);
		console.log("dictId: " + dictId);
		Template.instance().dict.set( dictId, abstract.length);
		console.log(Template.instance().dict.get(dictId));
	}

	// Set session so parent template can initialise form validation

	Session.set("formRendered", true);
});

Template.ProposalForm.events({
	'keyup .abstract-textarea' (event, template){
		let textareaId = "#" + event.currentTarget.id;
		let dictId = "abstract-" + Template.instance().data.language + "-Count";
		let text = $(textareaId).val();
		Template.instance().dict.set(dictId,text.length);
		/*
		let lang = Template.instance().data.language;
		let textareaId = "#abstract-" + lang;
		console.log(textareaId);
		console.log($(textareaId).val());
		*/
  },
});

Template.ProposalForm.helpers({
	abstractCompleted(){
		let dictId = "abstract-" + Template.instance().data.language + "-Count";
		let length = Template.instance().dict.get(dictId)
		if((length <= 280)&&(length >= 50)){
				return true;
		}
		return false;
  },
  abstractCount(){
		let textareaId = "#abstract-" + Template.instance().data.language;
		//console.log($(textareaId));
		let dictId = "abstract-" + Template.instance().data.language + "-Count";
		return Template.instance().dict.get(dictId);
  },
	getState(){
		let proposalId = FlowRouter.getParam("id");
		if(typeof proposalId != 'undefined'){
			return "view";
		}
		return "edit";
	},
	forArguments() {
		let lang = this.language.toString();
		let proposalId = FlowRouter.getParam("id");
		if(typeof proposalId != 'undefined'){
			return Comments.find({proposalId:proposalId,type:'for',language: lang});
		}

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
		let lang = this.language.toString();
		let proposalId = FlowRouter.getParam("id");
		if(typeof proposalId != 'undefined'){
			return Comments.find({proposalId:proposalId,type:'against',language: lang});
		}
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
				minlength: 50,
				maxlength: 280
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
			}
		},
		messages: {
			title: {
				required: 'Please make sure your proposal has a title.',
				minlength: "Use at least 5 characters."
			},
			abstract: {
				required: 'Please provide a short abstract for your proposal.',
				minlength: "Use at least 50 characters."
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
