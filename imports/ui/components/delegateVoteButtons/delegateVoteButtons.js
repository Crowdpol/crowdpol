import './delegateVoteButtons.html'
import { DelegateVotes } from '../../../api/delegateVotes/DelegateVotes.js'

Template.delegateVoteButtons.onCreated(function(){
	self = this;
	self.vote = new ReactiveVar();
	self.setVote = new ReactiveVar();
	self.voteReason = new ReactiveVar();
	self.charCount = new ReactiveVar(0);
	self.proposalId = Template.currentData().proposalId;
	self.autorun(function(){
		self.subscribe('delegateVotes.currentUser');
	});
});

Template.delegateVoteButtons.helpers({
	'delegateVote': function(){
		let result = DelegateVotes.findOne({proposalId: self.proposalId, delegateId: Meteor.userId()});
		let delegateVote = false;
		let delegateReason = '';
		if(result){
			if(typeof result.vote !== undefined){
				delegateVote = result.vote;
				delegateReason = result.reason;
			}
		}
		Template.instance().vote.set(delegateVote);
		Template.instance().voteReason.set(delegateReason);
	},
	'voteReason': function(){
		return Template.instance().voteReason.get();
	},
	'vote': function(){
		return Template.instance().setVote.get();
	},
	'voteSet': function(){
		let vote = Template.instance().vote.get();
		if(vote){
			return true;
		}

		return false;
	},
	'delegateClass': function(voteValue){
		let selectedVote = Template.instance().vote.get();
		if(selectedVote==voteValue){
			return "mdl-button--colored";
		}
	},
	'charCountString': function(){
		var charCount = Template.instance().charCount.get();
		if (charCount <= 420){
			return charCount + '/420'
		}
	},
	'isOpen': function() {
		let delegateVotes = DelegateVotes.findOne({proposalId: Template.currentData().proposalId, delegateId: Meteor.userId()});
		if(typeof delegateVotes !='undefined'){
			if(typeof delegateVotes.vote !='undefined'){
				Template.instance().vote.set(delegateVotes.vote);
			}
			if(typeof delegateVotes.reason !='undefined'){
				Template.instance().voteReason.set(delegateVotes.reason);
			}
		}
		// Delegate voting closes two weeks before a proposal expires
		var endDate = moment(Template.currentData().endDate);
    	var now = new Date();
    	var voteClose = endDate.subtract(2,'weeks');
    	if (voteClose.isAfter(now)) {
    		return true;
    	} else {
    		return false;
    	}

	}
});

Template.delegateVoteButtons.events({
	'click .delegate-vote-button' (event, template){
		'use strict';
		template.find('#mdl-custom-modal').style.display = "block";
		template.setVote.set(event.currentTarget.dataset.voteValue);
	},
	'click #final-vote': function(event, template){
		if (template.charCount.get() <= 420){
			var reason = template.find('#delegate-reason').value;
			var vote = template.setVote.get()
			Meteor.call('voteAsDelegate', {vote: vote, reason: reason, proposalId: template.proposalId}, function(error){
				if (error){
					console.log("error: "+error.reason);
					Bert.alert(error.reason, 'danger');
				} else {
					template.find('#mdl-custom-modal').style.display = "none";
					Bert.alert('Your vote has been cast', 'success');
				}
			});
		}
	},
	'click #remove-vote': function(event, template){
		var delegateVote = {vote: template.vote.get(), proposalId: template.proposalId};
		Meteor.call('deleteVoteAsDelegate', delegateVote, function(error){
				if (error){
					Bert.alert(error.reason, 'danger');
				} else {
					Bert.alert(TAPi18n.__('pages.proposals.view.voteRemoved'), 'success');
					let parentDiv = "#"+template.proposalId;
					$(parentDiv).children('button').each(function () {
					  $(this).removeClass("mdl-button--colored");
					});
					template.find('#mdl-custom-modal').style.display = "none";
					template.vote.set();
					template.voteReason.set();
				}
		});
	},
	'click .mdl-custom-close': function(event, template){
		'use strict';
		template.find('#mdl-custom-modal').style.display = "none";
	},
	'click window': function(event, template){
		'use strict';
		var modal = template.find('#mdl-custom-modal')
		if (event.target == modal) {
			modal.style.display = "none";
		}
	},
	'keyup textarea': function(event, template){
		template.charCount.set(event.target.value.length);
	}
});
