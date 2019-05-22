import './editProposal.html'
import './proposalForm.js'
import { Proposals } from '../../../api/proposals/Proposals.js'
import { Communities } from '../../../api/communities/Communities.js'
import { Comments } from '../../../api/comments/Comments.js'
import { Tags } from '../../../api/tags/Tags.js'
import { getTags } from '../../components/taggle/taggle.js'
import { setCoverState } from '../../components/cover/cover.js'
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
	self.subscribe('proposals.one', proposalId, function(){});
	self.autorun(function(){
		if (proposalId){
			// Edit an existing proposal
				proposal = Proposals.findOne({_id: proposalId})
				//check if proposal exists
				if(typeof proposal != 'undefined'){
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
					Session.set( 'hasCover',proposal.hasCover);
	        if(proposal.hasCover){
	          Session.set( 'coverPosition',proposal.coverPosition);
	          Session.set( 'coverURL',proposal.coverURL);
						setCoverState('edit-show');
						Session.set('coverState','edit-show');
	        }else{
						Session.set('coverState','edit-hide');
					}
					Session.set('invited',proposal.invited);
					self.subscribe('InvitedUsers',proposal.invited);
				//proposal does not exist, create a new one
				}else{
					Session.set("coverUrl",'url("https://images.unsplash.com/photo-1454166155302-ef4863c27e70?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjUxNTY3fQ&w=1500&dpi=2")');
				  Session.set( 'hasCover',false);
					setCoverState('edit-hide');
					Session.set('coverState','edit-hide');
					dict.set( 'startDate', defaultStartDate );
					dict.set( 'endDate', defaultEndDate);
					dict.set( 'tags',[]);
				}

			//self.subscribe('users.proposal',proposalId);

		} else {
			Session.set("coverURL",'url("https://images.unsplash.com/photo-1454166155302-ef4863c27e70?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjUxNTY3fQ&w=1500&dpi=2")');
		  Session.set( 'hasCover',false);
			Session.set('coverState','edit-hide');
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

		}
	});

	//THIS IS VERY IMPORTANT, WEIRD SHIT HAPPENS IF YOU LEAVE THIS OUT
	$(document).ready(function() {
	  $(window).keydown(function(event){
	    if(event.keyCode == 13) {
	      event.preventDefault();
	      return false;
	    }
	  });

	});
});

Template.EditProposal.helpers({
	hasHeader: function(){
		return Session.get('hasCover');
	},
	proposalContent: function(){
		proposalId = FlowRouter.getParam("id");
		if (proposalId){
			let proposal = Proposals.findOne({_id: proposalId});
			if(typeof proposal!=='undefined'){
				let content = proposal.content;
				if(typeof content!=='undefined'){
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
	totalInvites: function(language){
		return getTotalInvites();
	},
	invitationEnabled: function(){
		let settings = LocalStore.get('settings');
	  let maxCount = -1;
	  if(typeof settings != 'undefined'){
	    if(typeof settings.collaboratorLimit != 'undefined'){
	      maxCount = settings.collaboratorLimit;
	    }
	  }
	  if(maxCount==0){
	    return false;
	  }
		return true;
	},
	selectedInvites: function() {
		var invited = Session.get('invited');
		if (invited) {
			//Make the query non-reactive so that the selected invites don't get updated with a new search
			var userLength = Meteor.users.find({ _id : { $in :  invited} }).count();
			//return Meteor.users.find({ _id : { $in :  invited} });
			return getInvitedUsers(invited);
		}

	},
	emailedInvites: function() {
		return Session.get('emailInvites');
	},
	selectedTags: ()=> {
    tagsArray = Template.instance().templateDictionary.get('tags');
		return tagsArray;
		//return matchingTags = Tags.find({_id: {$in: tagsArray}});
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
		if(getTotalInvites()>0){
			openInviteModal();
		}else{
			saveChanges(event, template, 'App.proposal.edit');
		}
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
		if(getTotalInvites()>0){
			openInviteModal();
		}else{
			saveChanges(event, template, 'App.proposal.view');
		}
	},
	'click .remove-invite': function(e,t){
		removeUserInvite($(e.currentTarget).attr("data-user-id"));
	},
	'click .remove-invite-email': function(e,t){
		removeUserEmail($(e.currentTarget).attr("data-array-index"));
	},
	'click .c-datepicker-input': function(e,t){
		picker.open();
	},
	'input textarea, input input' : function( event , template){
		autosave(event, template);
  }
});

Template.InviteModal.events({
  'click #overlay, click #reject-button' (event, template){
    closeInviteModal();
  },
	'click #approve-button' (event, template){
		let parentTemplate = template.view.parentView.parentView.parentView._templateInstance;
		//getParentTemplateInstanceData();
		saveChanges(event, parentTemplate, 'App.proposal.view');
		closeInviteModal();
	}
});

Template.InviteModal.helpers({
	selectedInvitesCount: function(){
		var invited = Session.get('invited');
		if (invited) {
			return invited.length;
		}
		return 0;
	},
	selectedInvites: function() {
		var invited = Session.get('invited');
		if (invited) {
			//Make the query non-reactive so that the selected invites don't get updated with a new search
			var users = Meteor.users.find({ _id : { $in :  invited} },{reactive: false});
			return users;
		}
	},
	emailInviteCount: function() {
		var invited = Session.get('emailInvites');
		if (invited) {
			return invited.length;
		}
		return 0;
	},
	emailedInvites: function() {
		return Session.get('emailInvites');
	}
});
// Autosave function
export function autosave(event, template) {
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
	// Get Translatable field for each language and loop through them
	_.each(languages, function(language) {
		// Arguments For and Against
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
			//pointsFor: pointsFor,
			//pointsAgainst: pointsAgainst,
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
			let startValue = $('#startDate').val();
			let endValue = $('#endDate').val();
			if(startValue){
				startDate = new Date(startValue);
			}else{
				startDate = new Date();
			}
			if(endValue){
				endDate = new Date(endValue);
			}else{
				startDate = new Date();
			}
		}
		let newProposal = {
			content: content,
			// Non-translatable fields
			startDate: startDate,//new Date(2018, 8, 1),
			endDate: endDate,//new Date(2018, 8, 1),
			authorId: Meteor.userId(),
			invited: Session.get('invited'),
			tags: getTags(),//proposalTags,
			communityId: LocalStore.get('communityId'),
			stage: "draft",
			hasCover: Session.get("hasCover"),
			coverURL: Session.get("coverURL"),
			coverPosition: "0px"//Session.get("coverPosition")
		};
		var proposalId = FlowRouter.getParam("id");
		showToast({message: TAPi18n.__('pages.proposals.edit.alerts.saving')});
		//template.find('#autosave-toast-container').MaterialSnackbar.showSnackbar({message: TAPi18n.__('pages.proposals.edit.alerts.saving')});

		// If working on an existing proposal, save it, else create a new one
		if (proposalId){
			saveProposal(proposalId,newProposal,returnTo,template);
		} else {
			//create new proposal
			createProposal(proposalId,newProposal,returnTo,template);
		}
	}else{
		Bert.alert(TAPi18n.__('pages.proposals.edit.alerts.not-saved'), 'warning');
		return false;
	}
	return true;
};

function createProposal(proposalId,newProposal,returnTo,template){
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
				 }
			 });
			 //Create notifications for collaborators
			 if (newProposal.invited) {
				 sendNotifications(newProposal.invited,proposalId,newProposal.authorId);
				}
				Bert.alert(TAPi18n.__('pages.proposals.edit.alerts.proposal-created'), 'success');
			//showToast({message: TAPi18n.__('pages.proposals.edit.alerts.proposal-created')});
			//template.find('#autosave-toast-container').MaterialSnackbar.showSnackbar({message: TAPi18n.__('pages.proposals.edit.alerts.proposal-created')});
			if(returnTo){
				FlowRouter.go(returnTo, {id: proposalId});
			}
		}
	});
}

function saveProposal(proposalId,newProposal,returnTo,template){
	Meteor.call('saveProposalChanges', proposalId, newProposal, function(error){
	if (error){
			RavenClient.captureException(error);
			Bert.alert(error.reason, 'danger');
			return false;
		} else {
			//Create notifications for collaborators
			if (newProposal.invited) {
				sendNotifications(newProposal.invited,proposalId,newProposal.authorId);
			}
			Bert.alert(TAPi18n.__('pages.proposals.edit.alerts.changes-saved'), 'success');
			if(returnTo){
				FlowRouter.go(returnTo, {id: proposalId});
			}
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
	invited = Session.get("invited");
	emails.splice(index, 1);
	Session.set('emailInvites',emails);
}

function showToast(content){
	let selector = document.querySelector('#autosave-toast-container');
	if(selector){
		selector.MaterialSnackbar.showSnackbar(content);
	}
}

export function getTotalInvites(){
	let invitedUsers = Session.get("invited");
	let invitedEmails = Session.get('emailInvites');;
	let totalCount = 0;
	if(invitedUsers){
		totalCount=totalCount+invitedUsers.length;
	}
	if(invitedEmails){
		totalCount=totalCount+invitedEmails.length;
	}
	return totalCount;
}

openInviteModal = function(event) {
  if (event) event.preventDefault();
  $(".invite-modal").addClass('active');
  $("#overlay").addClass('dark-overlay');
}

closeInviteModal = function(event) {
  if (event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
  Session.set("showApproval",false);
  $(".invite-modal").removeClass('active');
  $("#overlay").removeClass('dark-overlay');
}

function sendNotifications(invited,proposalId,authorId){
	let emailInvites = Session.get('emailInvites');
	let url = '/proposals/view/' + proposalId;
	let author = Meteor.users.findOne({"_id":authorId});
	let authorName = author.profile.firstName;
	let fromEmail = author.emails[0].address;
	if(typeof author.profile.lastName != 'undefined'){
		authorName = authorName + ' ' + author.profile.lastName;
	}
	for (i=0; i < invited.length; i++) {
		var notification = {
			message: TAPi18n.__('notifications.proposals.invite',{authorName:authorName}),
			userId: invited[i],
			url: url,
			icon: 'description'
		}
		Meteor.call('createNotification', notification);
	}

	for (i=0; i < emailInvites.length; i++) {
		url = window.location.origin + '/proposals/view/' + proposalId;
		Meteor.call('sendProposalInvite', emailInvites[i], authorName, url, fromEmail);
	}

	//STEP 1: See if notifcation has been sent, else send new
	//STEP 2: Create proposal Invitations
	//STEP 3: Send email invitations
}

Template.EditProposal.onDestroyed(function(){
  timer.clear();
});
