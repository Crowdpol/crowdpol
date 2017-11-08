import './editProposal.html'
import Quill from 'quill'
import { Proposals } from '../../../api/proposals/Proposals.js'

Template.EditProposal.onCreated(function() {
	var self = this;
	self.autorun(function(){
		proposalId = FlowRouter.getParam("id")
		if (proposalId){
			// Edit an existing proposal
			self.subscribe('proposals.one', proposalId);
		}
	});
});

Template.EditProposal.onRendered(function(){
	var self = this;
	editor = new Quill('#body', {
		modules: { toolbar: '#toolbar' },
		theme: 'snow'
  	});
});

Template.EditProposal.helpers({
	proposal: ()=> {
		proposalId = FlowRouter.getParam("id")
		if (proposalId){
			var proposal = Proposals.findOne({_id: proposalId});
			// convert dates to the right string format for datepicker
			proposal.startDate = moment(proposal.startDate).format('YYYY-MM-DD');
			proposal.endDate = moment(proposal.endDate).format('YYYY-MM-DD');
			return proposal
		} else {
			return {
				title: '',
				abstract: '',
				body: '',
				startDate: moment().format('YYYY-MM-DD'),
				endDate: moment().format('YYYY-MM-DD')
			}
		}
		
	}
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
					Bert.alert('Proposal saved', 'success');
					if (proposalId){
						FlowRouter.go('App.proposal.edit', {id: proposalId});
					}
				}
			});
		} else {
			Meteor.call('createProposal', newProposal, function(error, proposalId){
				if (error){
					Bert.alert(error.reason, 'danger');
				} else {
					Bert.alert('Proposal saved', 'success');
					if (proposalId){
						FlowRouter.go('App.proposal.edit', {id: proposalId});
					}
				}
			});
		}

	}
});