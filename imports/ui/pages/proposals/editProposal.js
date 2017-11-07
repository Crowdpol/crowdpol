import './editProposal.html'
import Quill from 'quill'

Template.EditProposal.onCreated(function() {
	var self = this;
	self.autorun(function(){
		proposal = null;
		if (FlowRouter.getParam("id")){
			// Edit an existing proposal
			proposal = Meteor.call('getProposal', FlowRouter.getParam("id"));
		}
	});
});

Template.EditProposal.onRendered(function(){
	var self = this;
	/*var editor = new Quill('#editor', {
		modules: { toolbar: '#toolbar' },
		theme: 'snow'
  	});*/
});

Template.EditProposal.helpers({
	title: ()=> {
		if (proposal) {return proposal.title;} else {return '';}
	},
	abstract: ()=> {
		if (proposal) {return proposal.abstract;} else {return '';}
	},
	body: ()=> {
		if (proposal) {return proposal.body;} else {return '';}
	},
	startDate: ()=> {
		if (proposal) {return proposal.startDate;} else {return new Date();}
	},
	endDate: ()=> {
		if (proposal) {return proposal.endDate;} else {return new Date();}
	},
	invited: ()=> {
		if (proposal) {return proposal.invited;} else {return [];}
	},
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
		if (proposal){
			functionString = 'saveProposalChanges';
		} else {
			functionString = 'createProposal';
		}

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