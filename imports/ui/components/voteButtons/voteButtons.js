import './voteButtons.html'
import { DelegateVotes } from '../../../api/delegateVotes/DelegateVotes.js';
import { Votes } from '../../../api/votes/Votes.js';
Template.voteButtons.onCreated(function(){
	self = this;
	var dict = new ReactiveDict();
	self.dict = dict;
	self.proposalId = Template.currentData().proposalId;

	self.autorun(function(){
		self.subscribe('delegateVotes.forUserProposal',self.proposalId);
		self.subscribe('votes.forProposalCurrentUser',self.proposalId);
	});

});

Template.voteButtons.helpers({
	getVote: function(proposalId){
		let result = DelegateVotes.findOne({"proposalId" : proposalId});
		let delegateVote = false;
		if(result){
			if(typeof result.vote !== undefined){
				delegateVote = result.vote;
			}
		}
		Template.instance().dict.set('delegateVote',delegateVote);
		//User Vote
		let query = Votes.findOne({"proposalId" : proposalId});

		let vote = false;
		if(query){
			if(typeof query.vote !== undefined){
				vote = query.vote;
			}
		}
		Template.instance().dict.set('userVote',vote);
		if(vote){
			return "user-voted";
		}
	},
	userButtonClass: function(voteValue){

		let selectedVote = Template.instance().dict.get('userVote');
		console.log("userButtonClass: selectedVote: " + selectedVote + " voteValue: " + voteValue);
		//2. check if current selection matches existing vote
		if(selectedVote==voteValue){
			return "mdl-button--colored";
		}
	},
	delegateButtonClass: function(voteValue){
		let selectedVote = Template.instance().dict.get('delegateVote');
		//2. check if current selection matches existing vote
		if(selectedVote==voteValue){
			return "mdl-button--colored-delegate";
		}
	},
});

Template.voteButtons.events({

	'click .vote-button' (event, template){

		//1. check existing user vote
		let proposalId = event.currentTarget.dataset.proposalId;
		let voteValue = event.currentTarget.dataset.voteValue;
		let selectedVote = Template.instance().dict.get('userVote');
		console.log("vote button clicked: " + selectedVote + ", " + voteValue);
		//2. check if current selection matches existing vote
		if(selectedVote==voteValue){
			console.log("selected vote equals votevalue");
			//2.1 deselect vote
			removeVote(selectedVote,proposalId);
			let parentDiv = $(event.target).closest( "div" );
			parentDiv.removeClass("user-voted");
			parentDiv.children('button').each(function () {
			  $(this).removeClass("mdl-button--colored");
			});

		}else{
			console.log("not equal");
			//2.2 else set vote to selection
			vote(voteValue,proposalId);
			event.stopPropagation();
			$(event.target).closest( "div" ).addClass("user-voted");
			console.log($(event.target).closest( "div" ))
			//$(event.target).addClass("mdl-button--colored");
		}

	},
});

function vote(voteString, proposalId){
	var currentRole = LocalStore.get('currentUserRole');

	if (currentRole == 'Delegate'){
    // Vote as a delegate
    var delegateVote = {vote: voteString, proposalId: proposalId};
    Meteor.call('voteAsDelegate', delegateVote, function(error){
    	if (error){
    		Bert.alert(error.reason, 'danger');
    	} else {
    		Bert.alert(TAPi18n.__('pages.proposals.view.voteCast'), 'success');
    	}
    });
	} else {
	    // Vote as an individual voter
	    var vote = {vote: voteString, proposalId: proposalId, delegateId: ''};
	    Meteor.call('vote', vote, function(error){
	    	if (error){
	    		Bert.alert(error.reason, 'danger');
	    	} else {
	    		Bert.alert(TAPi18n.__('pages.proposals.view.voteCast'), 'success');
	    	}
	    });
	}
};

function removeVote(voteString, proposalId){
	var currentRole = LocalStore.get('currentUserRole');
	if (currentRole == 'Delegate'){
		// Vote as a delegate
		var delegateVote = {vote: voteString, proposalId: proposalId};
		Meteor.call('deleteVoteAsDelegate', delegateVote, function(error){
			if (error){
				Bert.alert(error.reason, 'danger');
			} else {
				Bert.alert(TAPi18n.__('pages.proposals.view.voteRemoved'), 'success');
			}
		});
	} else {
			// Vote as an individual voter
			var vote = {vote: voteString, proposalId: proposalId};
			Meteor.call('deleteVote', vote, function(error){
				if (error){
					Bert.alert(error.reason, 'danger');
				} else {
					Bert.alert(TAPi18n.__('pages.proposals.view.voteRemoved'), 'success');
				}
			});
	}
};

function removeDelegateVoteClass(proposalId){
	let identifier = "button[data-proposal-id="+proposalId+"]";
	$(identifier).each(function (index, value) {
		 if($(this).hasClass('mdl-button--colored-delegate')){

			 $(this).removeClass('mdl-button--colored-delegate');
		 }
	});
}
