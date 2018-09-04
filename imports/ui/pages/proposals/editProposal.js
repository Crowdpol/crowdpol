import './editProposal.html'
import Quill from 'quill'
import { Proposals } from '../../../api/proposals/Proposals.js'
import { Communities } from '../../../api/communities/Communities.js'
//import { setupTaggle } from '../../components/taggle/taggle.js'
import { getTags } from '../../components/taggle/taggle.js'
import "../../components/userSearch/userSearch.js"
import RavenClient from 'raven-js';




Template.EditProposal.onCreated(function(){
	self = this;

	// Reactive and Session Vars
	self.currentLang = new ReactiveVar(TAPi18n.getLanguage());
	self.invites = new ReactiveVar(null);
	Session.set('invited',[]);
	Session.set('invitedUsers',null);
	Session.set('emailInvites',[]);
	//Session.set('setupTaggle', true);

	var dict = new ReactiveDict();
	this.templateDictionary = dict;

	var defaultStartDate = moment().format('YYYY-MM-DD');
	var defaultEndDate = moment().add(1, 'week').format('YYYY-MM-DD');

	proposalId = FlowRouter.getParam("id");
	self.autorun(function(){
		self.subscribe('communities.all')
		if (proposalId){
			// Edit an existing proposal
			self.subscribe('proposals.one', proposalId, function(){
				proposal = Proposals.findOne({_id: proposalId})
				dict.set( 'createdAt', proposal.createdAt );
				dict.set( '_id', proposal._id);
				dict.set( 'startDate', moment(proposal.startDate).format('YYYY-MM-DD') || defaultStartDate );
				dict.set( 'endDate', moment(proposal.endDate).format('YYYY-MM-DD') || defaultEndDate);
				dict.set( 'authorId', proposal.authorId );
				dict.set( 'stage', proposal.stage );
				dict.set( 'status', proposal.status );
				dict.set( 'signatures', proposal.signatures || []);
				dict.set( 'tags', proposal.tags || []);
				Session.set('invited',proposal.invited);
			});
		} else {
			dict.set( 'startDate', defaultStartDate );
			dict.set( 'endDate', defaultEndDate);
		}
		
	});
});

Template.EditProposal.onRendered(function(){
	self = this;

	this.autorun(function() {
		// Wait for whole form to render before initialising fields
		if (Session.get("formRendered")) {
			validateForm();
			/*
			if (Session.get('setupTaggle')) {
				//Set up Taggle
				taggle = setupTaggle();
				self.taggle = new ReactiveVar(taggle);
				//Set up existing tags
				var tags = self.templateDictionary.get('tags');
				if (tags) { 
					var keywords = _.map(tags, function(tag){ return tag.keyword; })
					self.taggle.get().add(keywords); 
				}
				Session.set('setupTaggle', false);
			}
			*/
			
			//Initialise date fields
			self.find('#startDate').value = self.templateDictionary.get('startDate');
			self.find('#endDate').value = self.templateDictionary.get('endDate');
			Session.set("formRendered", false)
		} 
	});

});

Template.EditProposal.helpers({
	proposalContent: function(){
		proposalId = FlowRouter.getParam("id");
		if (proposalId){
			return Proposals.findOne({_id: proposalId}).content;
		}
	},
	languages: function(){
		var communityId = LocalStore.get('communityId');
		return Communities.findOne({_id: communityId}).settings.languages;
	},
	activeClass: function(language){
		var currentLang = TAPi18n.getLanguage();
		if (language == currentLang){
			return 'is-active';
		}
	},
	selectedInvites: function() {
		var invited = Session.get('invited');
		if (invited) {
			//Make the query non-reactive so that the selected invites don't get updated with a new search
			var users = Meteor.users.find({ _id : { $in :  invited} },{reactive: false});
			return users;
		}
	},
	emailedInvites: function() {
		return Session.get('emailInvites');
	},
	selectedTags: ()=> {
    tagsArray = Template.instance().templateDictionary.get('tags');
    tags = [];
    for(i=0;i<tagsArray.length;i++){
      tags.push(tagsArray[i].keyword);
    }
    return tags;
  }
});

Template.EditProposal.events({
	'click #save-proposal' (event, template){
		event.preventDefault();
		saveChanges(event, template, 'App.proposal.edit');
	},
	'click #back-button' (event, template) {
		//if (!window.confirm(TAPi18n.__('pages.proposals.edit.confirm-back'))){ 
			//event.preventDefault();
		//}
		event.preventDefault();
		saveChanges(event, template, 'App.proposals');
		FlowRouter.go('/proposals');
		//Session.set('proposalTab','my-proposals-tab');
	},
	'click #preview-proposal': function(event, template){
		event.preventDefault();
		saveChanges(event, template, 'App.proposal.view');
	},
	'click .remove-invite': function(e,t){
		removeUserInvite($(e.currentTarget).attr("data-user-id"));
	},
	'click .remove-invite-email': function(e,t){
		removeUserEmail($(e.currentTarget).attr("data-array-index"));
	},
	'click .c-datepicker-input': function(e,t){
		picker.open();
	}
});

Template.ProposalForm.onCreated(function(){
	var self = this;
	self.pointsFor = new ReactiveVar([]);
	self.pointsAgainst = new ReactiveVar([]);
});

Template.ProposalForm.onRendered(function(){
	var self = this;

	var allContent = self.data.content;
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

// Autosave function
function autosave(event, template) {
	// Save user input after 3 seconds of not typing
	timer.clear();

	timer.set(function() { 
		saveChanges(event, template, 'App.proposal.edit');  
	});
}

// Autosave timer
var timer = function(){
	var timer;

	this.set = function(saveChanges) {
		timer = Meteor.setTimeout(function() {
			saveChanges();
		}, Meteor.settings.public.defaultAutosaveTime)
	};

	this.clear = function() {
		Meteor.clearInterval(timer);
	};

	return this;    
}();

function saveChanges(event, template, returnTo){
	var communityId = LocalStore.get('communityId');
	var languages = Communities.findOne({_id: communityId}).settings.languages;
	var content = [];
	var contentCount = 0;
	// Get Translatable field for each language
	_.each(languages, function(language) {
		// Points For and Against
		var pointsFor = [];
		var pointsAgainst = [];
		$(`#points-for-list-${language}`).children('input').each(function() { pointsFor.push(this.value) });
		$(`#points-against-list-${language}`).children('input').each(function() { pointsAgainst.push(this.value) });

		var translation = {
			title: $(`#title-${language}`).val(),
			abstract: $(`#abstract-${language}`).val(),
			body: $(`#body-${language}`).val(),
			pointsFor: pointsFor,
			pointsAgainst: pointsAgainst
		};

		hasContent = false;
		// Test if each translation has any content before adding it to the proposal
		// If any field contains something other than whitespace, the translation should be added
		_.each(translation, function(item){ 
			if (/\S/.test(item)) {
				hasContent = true; 
				return;
			} 
		});

		if (hasContent) {
			translation.language = language;
			content.push(translation);
			contentCount+=1;
		}

	})
	//CHECK IF THERE IS SOME CONTENT IN THE PROPOSAL
	console.log("languages.length: " + languages.length + ", contentCount: " + contentCount);
	if(contentCount!=0){
		Meteor.call('transformTags', getTags(), communityId, function(error, proposalTags){
			if (error){
				RavenClient.captureException(error);
				Bert.alert(error, 'reason');
				return false;
			} else {
				let newProposal = {
					content: content,
					// Non-translatable fields
					startDate: new Date(template.find('#startDate').value),//new Date(2018, 8, 1),//
					endDate: new Date(template.find('#endDate').value),//new Date(2018, 8, 1),
					authorId: Meteor.userId(),
					invited: Session.get('invited'),
					tags: proposalTags,
					communityId: LocalStore.get('communityId'),
					stage: "draft"
			};

			var proposalId = FlowRouter.getParam("id");
			template.find('#autosave-toast-container').MaterialSnackbar.showSnackbar({message: TAPi18n.__('pages.proposals.edit.alerts.saving')});

			// If working on an existing proposal, save it, else create a new one
			if (proposalId){
				Meteor.call('saveProposalChanges', proposalId, newProposal, function(error){
					if (error){
						RavenClient.captureException(error);
						Bert.alert(error.reason, 'danger');
						return false;
					} else {
						var oldInvites = Proposals.findOne(proposalId).invited;
					    var newInvites = newProposal.invited;

					    if (oldInvites && newInvites) {
					        // Only send new invites if new collaborators have been added
					        var newCollaborators = _.difference(newInvites, oldInvites);
					        if (newCollaborators) {
					          // Create notification for each new collaborator
					          for (i=0; i<newCollaborators.length; i++) {
					            var notification = {
					              message: TAPi18n.__('notifications.proposals.invite'), 
					              userId: newCollaborators[i], 
					              url: '/proposals/view/' + proposalId, 
					              icon: 'people'
					            }
					            Meteor.call('createNotification', notification);
					          }
					        } 
					    }
						template.find('#autosave-toast-container').MaterialSnackbar.showSnackbar({message: TAPi18n.__('pages.proposals.edit.alerts.changes-saved')});
						FlowRouter.go(returnTo, {id: proposalId});
					}
				});
			} else {
				Meteor.call('createProposal', newProposal, function(error, proposalId){
					if (error){
						RavenClient.captureException(error);
						Bert.alert(error.reason, 'danger');
						return false;
					} else {
						 //Create notifications for collaborators
				        if (newProposal.invited) {
				          for (i=0; i < newProposal.invited.length; i++) {
				            var notification = {
				              message: TAPi18n.__('notifications.proposals.invite'), 
				              userId: newProposal.invited[i], 
				              url: '/proposals/view/' + proposalId, 
				              icon: 'people'
				            }
				            Meteor.call('createNotification', notification);
				          }
				        }
						template.find('#autosave-toast-container').MaterialSnackbar.showSnackbar({message: TAPi18n.__('pages.proposals.edit.alerts.proposal-created')});
						FlowRouter.go(returnTo, {id: proposalId});
					}
				});
			}
		}
		})
	}	
	return true;
};
function removeUserInvite(id){
	invited = Session.get("invited");
	var index = invited.indexOf(id);
	invited.splice(index, 1);
	Session.set("invited",invited);
}
function removeUserEmail(index){
	emails = Session.get('emailInvites');
	emails.splice(index, 1);
	Session.set('emailInvites',emails);
}

function validateForm(){
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