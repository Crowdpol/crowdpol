import './editProposal.html'
import './proposalForm.js'
import { Proposals } from '../../../api/proposals/Proposals.js'
import { Communities } from '../../../api/communities/Communities.js'
import { Comments } from '../../../api/comments/Comments.js'
//import { setupTaggle } from '../../components/taggle/taggle.js'
import { getTags } from '../../components/taggle/taggle.js'
import { getForArguments } from '../../components/arguments/arguments.js'
import { getAgainstArguments } from '../../components/arguments/arguments.js'
import { validateForm } from './proposalForm.js'
import "../../components/userSearch/userSearch.js"
import RavenClient from 'raven-js';

Template.EditProposal.onCreated(function(){
	self = this;
	var communityId = LocalStore.get('communityId');
	var settings = LocalStore.get('settings');
	// Reactive and Session Vars
	self.currentLang = new ReactiveVar(TAPi18n.getLanguage());
	self.invites = new ReactiveVar(null);
	self.fudge = new ReactiveVar(['hello']);
	Session.set('invited',[]);
	Session.set('invitedUsers',null);
	Session.set('emailInvites',[]);
	Session.set('arguments',[]);
	//Session.set('setupTaggle', true);

	var dict = new ReactiveDict();
	this.templateDictionary = dict;

	var defaultStartDate = moment().format('YYYY-MM-DD');
	var defaultEndDate = moment().add(1, 'week').format('YYYY-MM-DD');

	proposalId = FlowRouter.getParam("id");
	self.autorun(function(){
		if (proposalId){
			// Edit an existing proposal
			self.subscribe('proposals.one', proposalId, function(){
				proposal = Proposals.findOne({_id: proposalId})
				dict.set( 'showDates',false);
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
		//if dates are static and defined in settings, overrde defaults
		if(settings.showDates==false){
			dict.set( 'startDate', settings.defaultStartDate );
			dict.set( 'endDate', settings.defaultEndDate );
		}

	});
});

Template.EditProposal.onRendered(function(){
	self = this;

	this.autorun(function() {
		// Wait for whole form to render before initialising fields
		if (Session.get("formRendered")) {
			//validateForm();

			//Initialise date fields, check for override settings
			let settings = LocalStore.get('settings');
			if(settings.showDates){
				self.find('#startDate').value = self.templateDictionary.get('startDate');
				self.find('#endDate').value = self.templateDictionary.get('endDate');
			}
			Session.set("formRendered", false);
			//console.log(this);
		}
	});

});

Template.EditProposal.helpers({
	proposalContent: function(){
		proposalId = FlowRouter.getParam("id");
		if (proposalId){
			let proposal = Proposals.findOne({_id: proposalId});
			if(typeof proposal!=='undefined'){
				let content = proposal.content;
				if(typeof content!=='undefined'){
					//set arguments array before passing content to proposal form else arguments don't render
					/*let argumentsArray = [];
					var contentAll = _.find(content, function(item){
						argumentsFor = item.argumentsFor;
						if(argumentsFor)
						argumentsFor.forEach(function (argument, index) {
							argumentsArray.push(argument);
						});
						argumentsAgainst = item.argumentsAgainst;
						argumentsAgainst.forEach(function (argument, index) {
							argumentsArray.push(argument);
						});
					});
					Session.set('arguments',argumentsArray);*/
					return content;
				}
			}
		}else{
			return {};
		}
	},
	languages: function(){
		return LocalStore.get('languages');
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
  },
	showDates: ()=> {
		let settings = LocalStore.get('settings');
		return settings.showDates;
	},
	startDate: ()=> {
		let startDate = Template.instance().templateDictionary.get('startDate');
		return moment(startDate).format('DD MMMM YYYY');
	},
	endDate: ()=> {
		let endDate = Template.instance().templateDictionary.get('endDate');
		return moment(endDate).format('DD MMMM YYYY');
	},
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
		if(!saveChanges(event, template, 'App.proposals')){
			FlowRouter.go('/proposals');
		};
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
	var languages = LocalStore.get('languages');
	var content = [];
	var contentCount = 0;
	// Get Translatable field for each language
	_.each(languages, function(language) {
		// Points For and Against
		var pointsFor = [];
		var pointsAgainst = [];
		//var argumentsFor = [];
		//var argumentsAgainst = [];

		$(`#points-for-list-${language}`).children('input').each(function() { pointsFor.push(this.value) });
		$(`#points-against-list-${language}`).children('input').each(function() { pointsAgainst.push(this.value) });
		//$("[data-type='for'][data-lang='${language}'].argument-text").each(function() {console.log(this.html())});
		//$("[data-type='for'][data-lang='" + language + "'].argument-object").each(function() {argumentsFor.push(this.value)});
		//$("[data-type='against'][data-lang='" + language + "'].argument-object").each(function() {argumentsAgainst.push(this.value)});
		argumentsArray = Session.get("arguments");
		let forArguments = [];
		let againstArguments = [];
		argumentsArray.forEach(function (argument, index) {
			if(argument.type=='for'&&argument.language==language){
				forArguments.push(argument);
			}
			if(argument.type=='against'&&argument.language==language){
		  	againstArguments.push(argument);
			}
		});
		var translation = {
			title: $(`#title-${language}`).val(),
			abstract: $(`#abstract-${language}`).val(),
			body: $(`#body-${language}`).val(),
			argumentsFor: forArguments,
			argumentsAgainst: againstArguments,
			pointsFor: pointsFor,
			pointsAgainst: pointsAgainst,
			argumentsFor: forArguments,
			argumentsAgainst: againstArguments
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
		let settings = LocalStore.get('settings');
		//let startDate = template.instance().templateDictionary.get('startDate');
		//let endDate = template.instance().templateDictionary.get('endDate');
		if(settings.showDates==false){
			startDate = settings.defaultStartDate;
			endDate = settings.defaultEndDate;
		}else{
			startDate = new Date(template.find('#startDate').value);
			endDate = new Date(template.find('#endDate').value);
		}
		Meteor.call('transformTags', getTags(), communityId, function(error, proposalTags){
			if (error){
				RavenClient.captureException(error);
				Bert.alert(error, 'reason');
				return false;
			} else {
				let newProposal = {
					content: content,
					// Non-translatable fields
					startDate: startDate,//new Date(2018, 8, 1),
					endDate: endDate,//new Date(2018, 8, 1),
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
					saveProposal(proposalId,newProposal,returnTo,template);

				} else {
					//create new proposal
					createProposal(proposalId,newProposal,returnTo,template);
				}
			}
		});
	}else{
		return false;
	}
	return true;
};


function createProposal(propsalId,newProposal,returnTo,template){
	Meteor.call('createProposal', newProposal, function(error, proposalId){
		if (error){
			RavenClient.captureException(error);
			Bert.alert(error.reason, 'danger');
			return false;
		} else {
			 //add arguments
			 argumentsArray = Session.get("arguments");
			 Meteor.call('addArguments',argumentsArray,proposalId, function(error, proposalId){
				 if (error){
			 			RavenClient.captureException(error);
			 			Bert.alert(error.reason, 'danger');
			 			return false;
				 } else {
					 //console.log("arguments added");
				 }
			 });
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
			/*
			console.log("catch the problematic old invites");
			console.log(newProposal);
			console.log(Proposals.findOne(proposalId));
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
			}*/
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
