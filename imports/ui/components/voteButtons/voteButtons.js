import './voteButtons.html'

Template.voteButtons.onCreated(function(){
	self = this;
	var dict = new ReactiveDict();
	self.templateDictionary = dict;
	self.proposalId = Template.currentData().proposalId;

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
	delegateYesClass: function(){
		if (Template.instance().templateDictionary.get('delegateVote') == 'yes'){
			return 'delegate-color'
		}
	},
	delegateNoClass: function(){
		if (Template.instance().templateDictionary.get('delegateVote') == 'no'){
			return 'delegate-color'
		}
	},
});

Template.voteButtons.events({
	'click #vote-yes' (event, template){
		if (Meteor.user()){
			vote('yes', template.proposalId);
			template.templateDictionary.set('userVote', 'yes');
		} else {
			openSignInModal();
		}
	},

	'click #vote-no' (event, template){
		if (Meteor.user()){
			vote('no', template.proposalId);
			template.templateDictionary.set('userVote', 'no');
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
