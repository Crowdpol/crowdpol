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
			console.log('a proposal exists already, we will edit it')
		}
	});
});

Template.EditProposal.onRendered(function(){
	var self = this;
	var editor = new Quill('#body', {
		modules: { toolbar: '#toolbar' },
		theme: 'snow'
  	});
});

Template.EditProposal.helpers({
	proposal: ()=> {
		proposalId = FlowRouter.getParam("id")
		if (proposalId){
			console.log('we are editing an existing proposal, which is this:')
			console.log(proposalId)
			return Proposals.findOne({_id: proposalId});
		} else {
			console.log('we are editing a nonexistant proposal')
			return {
				title: '',
				abstract: '',
				body: '',
				startDate: new Date('03/25/2015'),
				endDate: new Date('03/25/2015')
			}
		}
		
	}
});

Template.EditProposal.events({
	'submit #edit-proposal-form' (event, template){
		event.preventDefault();
		let newProposal = {
			title: template.find('#title').value,
			abstract: template.find('#title').value,
			body: template.find('#title').value,
			startDate: new Date(template.find('#title').value),
			endDate: new Date(template.find('#title').value),
			authorId: Meteor.userId()
		};

		var functionString;

		// If working on an existing proposal, save it, else create a new one
		if (FlowRouter.getParam("id")){
			functionString = 'saveProposalChanges';
		} else {
			functionString = 'createProposal';
		}

		console.log('proposal')
		//console.log(proposal)
		console.log(functionString)

		Meteor.call(functionString, newProposal, function(error, proposalId){
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
});