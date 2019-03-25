import './voteButtons.html'

Template.voteButtons.onCreated(function(){
	self = this;
	var dict = new ReactiveDict();
	self.templateDictionary = dict;
	self.proposalId = Template.currentData().proposalId;

	self.autorun(function(){
		self.subscribe('delegateVotes.currentUser');
	});

	if (Meteor.user()) {
		Meteor.call('getUserDelegateVote', self.proposalId, function(error, result){
			if (error){
				Bert.alert(error.reason, 'danger');
			} else {
				dict.set( 'delegateVote', result );
			}
		})

		Meteor.call('getUserVoteFor', self.proposalId, Meteor.userId(), function(error, result){
			if (result){
				dict.set( 'userVote', result.vote );
			} else {
				dict.set( 'userVote', '' );
			}
		});
	}
});

Template.voteButtons.helpers({
	userYesClass: function(){
		if(Template.instance().templateDictionary.get('userVote') == 'yes'){
			return "mdl-button--colored-yes";
		}
	},
	userNoClass: function(){
		if(Template.instance().templateDictionary.get('userVote') == 'no'){
			return "mdl-button--colored-no";
		}
	},
	userAbstainClass: function(){
		if(Template.instance().templateDictionary.get('userVote') == 'abstain'){
			return "mdl-button--colored-abstain";
		}
	},
	delegateYesClass: function(){
		if (Template.instance().templateDictionary.get('delegateVote') == 'yes'){
			return 'mdl-button--colored-delegate'
		}
	},
	delegateNoClass: function(){
		if (Template.instance().templateDictionary.get('delegateVote') == 'no'){
			return 'mdl-button--colored-delegate'
		}
	},
	delegateAbstainClass: function(){
		if (Template.instance().templateDictionary.get('delegateVote') == 'abstain'){
			return 'mdl-button--colored-delegate'
		}
	}
});

Template.voteButtons.events({
	'click #vote-yes' (event, template){
		if (Meteor.user()){
			vote('yes', template.proposalId);
			template.templateDictionary.set('userVote', 'yes');
			removeDelegateVoteClass(template.proposalId);
		} else {
			openSignInModal();
		}
	},

	'click #vote-no' (event, template){
		if (Meteor.user()){
			vote('no', template.proposalId);
			template.templateDictionary.set('userVote', 'no');
			removeDelegateVoteClass(template.proposalId);
		} else {
			openSignInModal();
		}
	},

	'click #vote-abstain' (event, template){
		if (Meteor.user()){
			vote('abstain', template.proposalId);
			template.templateDictionary.set('userVote', 'abstain');
			removeDelegateVoteClass(template.proposalId);
		} else {
			openSignInModal();
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

function removeDelegateVoteClass(proposalId){
	console.log(Meteor.userId());
	let identifier = "button[data-proposal-id="+proposalId+"]";
	$(identifier).each(function (index, value) {
		console.log($(this).hasClass('mdl-button--colored-delegate'));
		 if($(this).hasClass('mdl-button--colored-delegate')){

			 $(this).removeClass('mdl-button--colored-delegate');
		 }
	});
}
