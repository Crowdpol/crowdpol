import './editProposal.html'
import './proposalForm.js'
import { Proposals } from '../../../api/proposals/Proposals.js'
import { Communities } from '../../../api/communities/Communities.js'
//import { setupTaggle } from '../../components/taggle/taggle.js'
import { getTags } from '../../components/taggle/taggle.js'
import { validateForm } from './proposalForm.js'
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
			dict.set( 'tags',[]);
		}

	});
});

Template.EditProposal.onRendered(function(){
	self = this;

	this.autorun(function() {
		// Wait for whole form to render before initialising fields
		if (Session.get("formRendered")) {
			/*
			validateForm();

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
			//console.log(self.templateDictionary.get('startDate'));
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
		}else{
			//console.log("could not find proposal content");
			return "";
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
		//console.log(tags);
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
		//FlowRouter.go('/proposals');
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
			argumentsFor: [],
			argumentsAgainst: [],
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
					startDate: new Date(template.find('#startDate').value),//new Date(2018, 8, 1),
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
					//console.log(newProposal);
					saveProposal(proposalId,newProposal,returnTo,template);

				} else {
					//create new proposal
					createProposal(proposalId,newProposal,returnTo,template);
				}
			}
		})
	}
	return true;
};


function createProposal(propsalId,newProposal,returnTo,template){
	//console.log("Create Proposal function called");
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

function saveProposal(proposalId,newProposal,returnTo,template){
	//console.log("Save Proposal function called");
	Meteor.call('saveProposalChanges', proposalId, newProposal, function(error){
	if (error){
			RavenClient.captureException(error);
			Bert.alert(error.reason, 'danger');
			return false;
		} else {
			var oldInvites = Proposals.findOne(proposalId).invited;
			var newInvites = null;
			if('invited' in newProposal){
				newInvites = newProposal.invited;
			}
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
}

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
