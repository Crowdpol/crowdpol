import './proposalForm.html'
import Quill from 'quill'
import { Proposals } from '../../../api/proposals/Proposals.js'
import { Communities } from '../../../api/communities/Communities.js'
//import { setupTaggle } from '../../components/taggle/taggle.js'
import { getTags } from '../../components/taggle/taggle.js'
import "../../components/userSearch/userSearch.js"
import RavenClient from 'raven-js';

Template.ProposalForm.onCreated(function(){
	var self = this;
	self.pointsFor = new ReactiveVar([]);
	self.pointsAgainst = new ReactiveVar([]);
});

Template.ProposalForm.onRendered(function(){
	var self = this;

	var allContent = self.data.content;
	//if(typeof allContent==='undefined'){
		//console.log("here is your problem");
	//}
	var language = self.data.language
	var content = _.find(allContent, function(item){ return item.language == language});

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

});
