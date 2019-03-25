import './delegateVoteButtons.html'
import { DelegateVotes } from '../../../api/delegateVotes/DelegateVotes.js'

Template.delegateVoteButtons.onCreated(function(){
	self = this;
	self.vote = new ReactiveVar();
	self.voteReason = new ReactiveVar();
	self.charCount = new ReactiveVar(0);
	self.proposalId = Template.currentData().proposalId;
	self.autorun(function(){
		/* PREVIOUS WAY, NO REPLACING WITH SUBSCRIPTION TO MAKE IT REACTIVE
		Meteor.call('getDelegateVoteFor', self.proposalId, Meteor.userId(), function(error, result){
			if (error){
				Bert.alert(error.reason, 'danger');
			} else {
				//check if the delegate has already voted
				if(typeof result !='undefined'){
					if(typeof result.vote !='undefined'){
						self.vote.set(result.vote);
					}
				}
			}
		});
		*/
		self.subscribe('delegateVotes.currentUser');

	});
});

Template.delegateVoteButtons.helpers({
	'delegateVote': function(){
		DelegateVotes.findOne({proposalId: self.proposalId, delegateId: Meteor.userId()});
	},
	'voteReason': function(){
		return Template.instance().voteReason.get();
	},
	'delegateYesClass': function(){
		if (Template.instance().vote.get() == 'yes'){
			return 'mdl-button--colored-yes'
		}
	},
	'delegateAbstainClass': function(){
		if (Template.instance().vote.get() == 'abstain'){
			return 'mdl-button--colored-abstain'
		}
	},
	'delegateNoClass': function(){
		if (Template.instance().vote.get() == 'no'){
			return 'mdl-button--colored-no'
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
		console.log("{proposalId: " +  self.proposalId +",delegateId: " +  Meteor.userId() + "}");
		if(typeof delegateVotes !='undefined'){
			if(typeof delegateVotes.vote !='undefined'){
				console.log(delegateVotes.vote);
				Template.instance().vote.set(delegateVotes.vote);
			}else{
				console.log("delegateVotes.vote undefined");
			}
			if(typeof delegateVotes.reason !='undefined'){
				console.log(delegateVotes.reason);
				Template.instance().voteReason.set(delegateVotes.reason);
			}else{
				console.log("delegateVotes.reason undefined");
			}
		}else{
			console.log("delegateVotes undefined");
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
	'click #delegate-vote-yes': function(event, template){
		'use strict';
		template.find('#mdl-custom-modal').style.display = "block";
		template.vote.set('yes');
	},
	'click #delegate-vote-abstain': function(event, template){
		'use strict';
		template.find('#mdl-custom-modal').style.display = "block";
		template.vote.set('abstain');
	},
	'click #delegate-vote-no': function(event, template){
		'use strict';
		template.find('#mdl-custom-modal').style.display = "block";
		template.vote.set('no');
	},
	'click #final-vote': function(event, template){
		if (template.charCount.get() <= 420){
			var reason = template.find('#delegate-reason').value;
			var vote = template.vote.get()
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
