import './delegateVoteButtons.html'

Template.delegateVoteButtons.onCreated(function(){
	self = this;
	self.vote = new ReactiveVar();
	var proposalId = FlowRouter.getParam("id");

	self.autorun(function(){
		Meteor.call('getDelegateVoteFor', proposalId, Meteor.userId(), function(error, result){
			if (error){
				Bert.alert(error.reason, 'danger');
			} else {
				self.vote.set(result.vote);
			}
		});
	});
});

Template.delegateVoteButtons.helpers({
	'delegateYesClass': function(){
		if (Template.instance().vote.get() == 'yes'){
			return 'mdl-button--colored'
		}
	},
	'delegateNoClass': function(){
		if (Template.instance().vote.get() == 'no'){
			return 'mdl-button--colored'
		}
	}
});

Template.delegateVoteButtons.events({
	'click #delegate-vote-yes': function(event, template){
		'use strict';
		template.find('#mdl-custom-modal').style.display = "block";
		template.vote.set('yes');
	},
	'click #delegate-vote-no': function(event, template){
		'use strict';
		template.find('#mdl-custom-modal').style.display = "block";
		template.vote.set('no');
	},
	'click #final-vote': function(event, template){
		var reason = template.find('#delegate-reason').value;
		var proposalId = FlowRouter.getParam("id");
		var vote = template.vote.get()
		Meteor.call('voteAsDelegate', {vote: vote, reason: reason, proposalId: proposalId}, function(error){
			if (error){
				Bert.alert(error.reason, 'danger');
			} else {
				template.find('#mdl-custom-modal').style.display = "none";
				Bert.alert('Your vote has been cast', 'success');
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
	}
});