import './editProposal.html'
import Quill from 'quill'
import { Proposals } from '../../../api/proposals/Proposals.js'
import { setupTaggle } from '../../components/taggle/taggle.js'
import "./styles.css"

Template.EditProposal.onCreated(function(){
	console.log("created started");
	var self = this;
	Template.instance().pointsFor = new ReactiveVar([]);
  	Template.instance().pointsAgainst = new ReactiveVar([]);
});

Template.EditProposal.onRendered(function(){
	var self = this;
	// Form Validations
	$( "#edit-proposal-form" ).validate({
		debug: true,
		ignore: "",
		rules: {
			title: {
				required: true,
				minlength: 5
			},
			abstract: {
				required: true,
				minlength: 5
			},
			body: {
				required: true,
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
				maxlength: 160
			},
			inputPointAgainst: {
				required: false,
				minlength: 1,
				maxlength: 160
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
			/*startDate: {
				required: 'Please indicate when voting will open for this proposal.'
			},
			endDate: {
				required: 'Please indicate when voting will close for this proposal.'
			},*/
		}
	});

	// Initialise Quill editor
	editor = new Quill('#body-editor', {
		modules: { toolbar: '#toolbar' },
		theme: 'snow'
  	});
  	
  	editor.on('text-change', function (delta, source) {
  		// Copy quill editor's contents to hidden input for validation
		var bodyText = self.find('.ql-editor').innerHTML;
		self.find('#body').value = bodyText;
	});
	// Set values of components once rendered
	// (quill editor must be initialised before content is set)
	var taggle = setupTaggle();
  	self.taggle = new ReactiveVar(taggle);

  	self.autorun(function(){
		proposalId = FlowRouter.getParam("id");
		
		if (proposalId){
			// Edit an existing proposal
			self.subscribe('proposals.one', proposalId, function(){
				proposal = Proposals.findOne({_id: proposalId});
				self.find('#title').value = proposal.title;
				self.find('#abstract').value = proposal.abstract;
				self.find('.ql-editor').innerHTML = proposal.body;
				self.find('#body').value = proposal.body;
				//self.find('#startDate').value = moment(proposal.startDate).format('YYYY-MM-DD');
				//self.find('#endDate').value = moment(proposal.endDate).format('YYYY-MM-DD');
				self.find('#invited').value = proposal.invited.join(',');
				self.taggle.get().add(_.map(proposal.tags, function(tag){ return tag.keyword; }));
				if (proposal.pointsFor != null){
					self.pointsFor.set(proposal.pointsFor);
				}
				if (proposal.pointsAgainst != null){
					self.pointsAgainst.set(proposal.pointsAgainst);
				}
			});
		}
	});
});

Template.EditProposal.events({
	'submit #edit-proposal-form' (event, template){
		event.preventDefault();
		saveChanges(event, template, 'App.proposal.edit');
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
	}
});

Template.EditProposal.helpers({
  pointsFor() {
    return Template.instance().pointsFor.get();
  },
  pointsAgainst() {
    return Template.instance().pointsAgainst.get();
  }
});

function saveChanges(event, template, returnTo){
	Meteor.call('transformTags', template.taggle.get().getTagValues(), function(error, proposalTags){
		if (error){
			Bert.alert(error, 'reason');
		} else {
			let newProposal = {
			title: template.find('#title').value,
			abstract: template.find('#abstract').value,
			body: template.find('#body').value,
			startDate: new Date(2018, 8, 1),//new Date(template.find('#startDate').value),
			endDate: new Date(2018, 8, 1),//new Date(template.find('#endDate').value),
			authorId: Meteor.userId(),
			invited: template.find('#invited').value.split(','),
			tags: proposalTags,
			pointsFor: template.pointsFor.get(),
			pointsAgainst: template.pointsAgainst.get(),
			references: ['']
		};

		var proposalId = FlowRouter.getParam("id");

		// If working on an existing proposal, save it, else create a new one
		if (proposalId){
			Meteor.call('saveProposalChanges', proposalId, newProposal, function(error){
				if (error){
					Bert.alert(error.reason, 'danger');
				} else {
					Bert.alert('Changes saved', 'success');
					FlowRouter.go(returnTo, {id: proposalId});
				}
			});
		} else {
			Meteor.call('createProposal', newProposal, function(error, proposalId){
				if (error){
					Bert.alert(error.reason, 'danger');
				} else {
					Bert.alert('Proposal created', 'success');
					FlowRouter.go(returnTo, {id: proposalId});
				}
			});
		}
		}
	})
	
	
};