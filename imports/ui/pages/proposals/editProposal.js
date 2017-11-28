import './editProposal.html'
import Quill from 'quill'
import { Proposals } from '../../../api/proposals/Proposals.js'
import { setupTaggle } from '../../components/taggle/taggle.js'

Template.EditProposal.onRendered(function(){
	var self = this;

	// Form Validations
	$( "#edit-proposal-form" ).validate({
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

  	var taggle = setupTaggle();
  	self.taggle = new ReactiveVar(taggle);

	// Set values of components once rendered
	// (quill editor must be initialised before content is set)
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
				self.find('#startDate').value = moment(proposal.startDate).format('YYYY-MM-DD');
				self.find('#endDate').value = moment(proposal.endDate).format('YYYY-MM-DD');
				self.find('#invited').value = proposal.invited.join(',');
				self.taggle.get().add(_.map(proposal.tags, function(tag){ return tag.keyword; }));
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
		saveChanges(event, template, 'App.proposal.view');
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
			startDate: new Date(template.find('#startDate').value),
			endDate: new Date(template.find('#endDate').value),
			authorId: Meteor.userId(),
			invited: template.find('#invited').value.split(','),
			tags: proposalTags
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