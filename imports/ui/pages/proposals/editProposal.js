import './editProposal.html'
import Quill from 'quill'
import { Proposals } from '../../../api/proposals/Proposals.js'
import { Communities } from '../../../api/communities/Communities.js'
import { setupTaggle } from '../../components/taggle/taggle.js'
import "../../components/userSearch/userSearch.js"
import RavenClient from 'raven-js';

Template.EditProposal.onCreated(function(){
	self = this;
	self.autorun(function(){
		self.subscribe('communities.all')
	});
});

Template.EditProposal.helpers({
	languages: function(){
		var communityId = LocalStore.get('communityId');
		return Communities.findOne({_id: communityId}).settings.languages;
	},
	activeClass: function(language){
	    var currentLang = TAPi18n.getLanguage();
	    if (language == currentLang){
	      return 'is-active';
	    }
	}
});

Template.ProposalForm.onCreated(function(){
	var self = this;
	Template.instance().pointsFor = new ReactiveVar([]);
  	Template.instance().pointsAgainst = new ReactiveVar([]);
  	Template.instance().invites = new ReactiveVar(null);
  	Session.set('invited',[]);
  	Session.set('invitedUsers',null);
  	Session.set('emailInvites',[]);
});

Template.ProposalForm.onRendered(function(){
	var self = this;
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
	var top = $("#invited-users").position().top + 40;
	var left = $("#invited").position().left + 15;
  	//$("#autosuggest-results").css({top: top, left: left});

	// Initialise Quill editor
	editor = new Quill('#body-editor-sv', {
		modules: { toolbar: '#toolbar-sv' },
		theme: 'snow'
  	});
  	
  	editor.on('text-change', function (delta, source) {
  		// Copy quill editor's contents to hidden input for validation
		var bodyText = self.find('.ql-editor').innerHTML;
		self.find('#body').value = bodyText;
		// Call Autosave
		autosave(this, self)
	});
	// Set values of components once rendered
	// (quill editor must be initialised before content is set)
	var taggle = setupTaggle();
  	self.taggle = new ReactiveVar(taggle);

  	self.autorun(function(){
  		//self.subscribe("users.all");
  		
		proposalId = FlowRouter.getParam("id");
		var defaultStartDate = moment().format('YYYY-MM-DD');
		var defaultEndDate = moment().add(1, 'week').format('YYYY-MM-DD');
		
		if (proposalId){
			// Edit an existing proposal
			self.subscribe('proposals.one', proposalId, function(){
				proposal = Proposals.findOne({_id: proposalId});
				self.find('#title').value = proposal.title || '';
				self.find('#abstract').value = proposal.abstract || '';
				self.find('.ql-editor').innerHTML = proposal.body || '';
				self.find('#body').value = proposal.body || '';
				self.find('#startDate').value = moment(proposal.startDate).format('YYYY-MM-DD') || defaultStartDate;
				self.find('#endDate').value = moment(proposal.endDate).format('YYYY-MM-DD') || defaultEndDate;
				Session.set('invited',proposal.invited);
				self.taggle.get().add(_.map(proposal.tags, function(tag){ return tag.keyword; }));
				if (proposal.pointsFor != null){
					self.pointsFor.set(proposal.pointsFor);
				}
				if (proposal.pointsAgainst != null){
					self.pointsAgainst.set(proposal.pointsAgainst);
				}
				
			});
		} else {
			self.find('#startDate').value = defaultStartDate;
			self.find('#endDate').value = defaultEndDate;
		}
	});
});

Template.ProposalForm.events({
	'submit #edit-proposal-form' (event, template){
		event.preventDefault();
		saveChanges(event, template, 'App.proposal.edit');
	},
	'click #back-button' (event, template) {
		if (!window.confirm(TAPi18n.__('pages.proposals.edit.confirm-back'))){ 
			event.preventDefault();
		}
	},
	'click #preview-proposal': function(event, template){
		event.preventDefault();
		saveChanges(event, template, 'App.proposal.view');
	},
	'click #add-point-for': function(event, template){
		event.preventDefault();
		var instance = Template.instance();
		var tempArray = instance.pointsFor.get();
		var string = template.find('#inputPointFor').value;
		if(tempArray.indexOf(string) > -1){
			var listItemId = "#point-for-" + tempArray.indexOf(string);
			$(listItemId).fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
		}else{
			tempArray.push(string);
			instance.pointsFor.set(tempArray);
			template.find('#inputPointFor').value = "";
			$("#pointsForWrap").removeClass("is-dirty");
		}
	},
	'click #add-point-against': function(event, template){
		event.preventDefault();
		var instance = Template.instance();
		var tempArray = instance.pointsAgainst.get();
		var string = template.find('#inputPointAgainst').value;
		if(tempArray.indexOf(string) > -1){
			var listItemId = "#point-against-" + tempArray.indexOf(string);
			$(listItemId).fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
		}else{
			tempArray.push(string);
			instance.pointsAgainst.set(tempArray);
			template.find('#inputPointAgainst').value = "";
			$("#pointsAgainstWrap").removeClass("is-dirty");
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
	'click .remove-invite': function(e,t){
    	removeUserInvite($(e.currentTarget).attr("data-user-id"));
	},
	'click .remove-invite-email': function(e,t){
	    removeUserEmail($(e.currentTarget).attr("data-array-index"));
	},
	'input textarea, input input' : function( event , template){
		autosave(event, template);
  	},
});

Template.ProposalForm.helpers({
  pointsFor() {
    return Template.instance().pointsFor.get();
  },
  pointsAgainst() {
    return Template.instance().pointsAgainst.get();
  },
  selectedInvites: function() {
  	//Make the query non-reactive so that the selected invites don't get updated with a new search
    var users = Meteor.users.find({ _id : { $in :  Session.get('invited')} },{reactive: false});
    return users;
  },
  emailedInvites: function() {
    return Session.get('emailInvites');
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
	Meteor.call('transformTags', template.taggle.get().getTagValues(), communityId, function(error, proposalTags){
		if (error){
			RavenClient.captureException(error);
			Bert.alert(error, 'reason');
		} else {
			let newProposal = {
			title: template.find('#title').value,
			abstract: template.find('#abstract').value,
			body: template.find('#body').value,
			startDate: new Date(template.find('#startDate').value),//new Date(2018, 8, 1),//
			endDate: new Date(template.find('#endDate').value),//new Date(2018, 8, 1),
			authorId: Meteor.userId(),
			invited: Session.get('invited'),
			tags: proposalTags,
			pointsFor: template.pointsFor.get(),
			pointsAgainst: template.pointsAgainst.get(),
			references: [''],
			communityId: LocalStore.get('communityId')
		};

		var proposalId = FlowRouter.getParam("id");

		template.find('#autosave-toast-container').MaterialSnackbar.showSnackbar({message: TAPi18n.__('pages.proposals.edit.alerts.saving')});

		// If working on an existing proposal, save it, else create a new one
		if (proposalId){
			Meteor.call('saveProposalChanges', proposalId, newProposal, function(error){
				if (error){
					RavenClient.captureException(error);
					Bert.alert(error.reason, 'danger');
				} else {
					template.find('#autosave-toast-container').MaterialSnackbar.showSnackbar({message: TAPi18n.__('pages.proposals.edit.alerts.changes-saved')});
					FlowRouter.go(returnTo, {id: proposalId});
				}
			});
		} else {
			Meteor.call('createProposal', newProposal, function(error, proposalId){
				if (error){
					RavenClient.captureException(error);
					Bert.alert(error.reason, 'danger');
				} else {
					template.find('#autosave-toast-container').MaterialSnackbar.showSnackbar({message: TAPi18n.__('pages.proposals.edit.alerts.proposal-created')});
					FlowRouter.go(returnTo, {id: proposalId});
				}
			});
		}
		}
	})
	
	
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