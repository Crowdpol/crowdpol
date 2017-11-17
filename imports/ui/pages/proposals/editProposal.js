import './editProposal.html'
import Quill from 'quill'
import { Proposals } from '../../../api/proposals/Proposals.js'
import Taggle from 'taggle'
import '../../../../node_modules/taggle/example/css/taggle.min.css'

Template.EditProposal.onRendered(function(){
	var self = this;

	var taggle = new Taggle('proposal-taggle', {placeholder: 'Tag your proposal'});
	var availableTags = ['environment', 'politics', 'technology', 'economics']
	var container = taggle.getContainer();
	var input = taggle.getInput();

$(input).autocomplete({
    source: availableTags, 
    appendTo: container,
    position: { at: "left bottom", of: container },
    select: function(event, data) {
        event.preventDefault();
        //Add the tag if user clicks
        if (event.which === 1) {
            taggle.add(data.item.value);
        }
    }
});

	// Initialise Quill editor
	editor = new Quill('#body', {
		modules: { toolbar: '#toolbar' },
		theme: 'snow'
  	});

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
				self.find('#startDate').value = moment(proposal.startDate).format('YYYY-MM-DD');
				self.find('#endDate').value = moment(proposal.endDate).format('YYYY-MM-DD');
				self.find('#invited').value = proposal.invited.join(',');
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
	let newProposal = {
			title: template.find('#title').value,
			abstract: template.find('#abstract').value,
			body: template.find('.ql-editor').innerHTML,
			startDate: new Date(template.find('#startDate').value),
			endDate: new Date(template.find('#endDate').value),
			authorId: Meteor.userId(),
			invited: template.find('#invited').value.split(',')
		};
		var proposalId = FlowRouter.getParam("id");

		// If working on an existing proposal, save it, else create a new one
		if (proposalId){
			Meteor.call('saveProposalChanges', proposalId, newProposal, function(error, proposalId){
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
};