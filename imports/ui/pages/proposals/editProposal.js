import './editProposal.html'
import Quill from 'quill'
import { Proposals } from '../../../api/proposals/Proposals.js'

Template.EditProposal.onRendered(function(){
	var self = this;
	editor = new Quill('#body', {
		modules: { toolbar: '#toolbar' },
		theme: 'snow'
  	});

	// set values of components once rendered
	// (quill editor must be initialised before content is set)
	self.autorun(function(){
		proposalId = FlowRouter.getParam("id")
		if (proposalId){
			// Edit an existing proposal
			self.subscribe('proposals.one', proposalId, function(){
				proposal = Proposals.findOne({_id: proposalId});
				self.find('#title').value = proposal.title;
				self.find('#abstract').value = proposal.abstract;
				self.find('.ql-editor').innerHTML = proposal.body;
				self.find('#startDate').value = moment(proposal.startDate).format('YYYY-MM-DD');
				self.find('#endDate').value = moment(proposal.endDate).format('YYYY-MM-DD');
			});
		}
	});

});

Template.EditProposal.events({
	'submit #edit-proposal-form' (event, template){
		event.preventDefault();
		let newProposal = {
			title: template.find('#title').value,
			abstract: template.find('#abstract').value,
			body: template.find('.ql-editor').innerHTML,
			startDate: new Date(template.find('#startDate').value),
			endDate: new Date(template.find('#endDate').value),
			authorId: Meteor.userId()
		};
		var proposalId = FlowRouter.getParam("id");

		// If working on an existing proposal, save it, else create a new one
		if (proposalId){
			Meteor.call('saveProposalChanges', proposalId, newProposal, function(error, proposalId){
				if (error){
					Bert.alert(error.reason, 'danger');
				} else {
					Bert.alert('Changes saved', 'success');
				}
			});
		} else {
			Meteor.call('createProposal', newProposal, function(error, proposalId){
				if (error){
					Bert.alert(error.reason, 'danger');
				} else {
					Bert.alert('Proposal created', 'success');
					FlowRouter.go('App.proposal.edit', {id: proposalId});
				}
			});
		}

	}
});