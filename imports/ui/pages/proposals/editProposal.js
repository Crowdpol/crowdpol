import './editProposal.html'
import Quill from 'quill'
import { Proposals } from '../../../api/proposals/Proposals.js'
import { setupTaggle } from '../../components/taggle/taggle.js'

Template.EditProposal.onCreated(function(){
	console.log("created started");
	var self = this;
	self.pointsFor = new ReactiveVar([]);
  	self.pointsAgainst = new ReactiveVar([]);
//});

//Template.EditProposal.onRendered(function(){
	//console.log("rendered started");
	//var self = this;
	//self.pointsFor = new ReactiveVar(['point one','point two','point three']);
  	//self.pointsAgainst = new ReactiveVar(['point one','point two','point three']);
  	//console.log(Template.instance().pointsFor.get());
  	//self.pointsFor = ['point one','point two','point three'];//proposal.pointsFor;
	//self.pointsAgainst = ['point one','point two','point three'];//proposal.pointsAgainst;
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
	/*
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
	*/

  	
  	

	// Set values of components once rendered
	// (quill editor must be initialised before content is set)
	
});

Template.EditProposal.onRendered(function(){
	var self = this;
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
				self.pointsFor = proposal.pointsFor;
				self.pointsAgainst = proposal.pointsAgainst;
				console.log(self.pointsFor);
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
		var tempArray = template.pointsFor.get();
		var string = template.find('#input-point-for').value;
		if(tempArray.indexOf(string) > -1){
			var listItemId = "#point-for-" + tempArray.indexOf(string);
			$(listItemId).fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
		}else{
			tempArray.push(string);
			template.pointsFor.set(tempArray);
		}
	},
	'click #add-point-against': function(event, template){
		event.preventDefault();
		var tempArray = template.pointsAgainst.get();
		var string = template.find('#input-point-against').value;
		if(tempArray.indexOf(string) > -1){
			var listItemId = "#point-against-" + tempArray.indexOf(string);
			$(listItemId).fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
		}else{
			tempArray.push(string);
			template.pointsAgainst.set(tempArray);
		}
	},
	'click #remove-point-for': function(event, template){
		event.preventDefault();
		var index = event.currentTarget.getAttribute('data-id');
		var tempArray = template.pointsFor.get();
		tempArray.splice(index, 1);
		template.pointsFor.set(tempArray);
	},
	'click #remove-point-against': function(event, template){
		event.preventDefault();
		var index = event.currentTarget.getAttribute('data-id');
		var tempArray = template.pointsAgainst.get();
		tempArray.splice(index, 1);
		template.pointsAgainst.set(tempArray);
	},
});

Template.EditProposal.helpers({
  pointsFor() {
  	console.log(Template.instance().pointsFor.get());
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
			startDate: new Date(template.find('#startDate').value),
			endDate: new Date(template.find('#endDate').value),
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