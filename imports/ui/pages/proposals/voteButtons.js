import './voteButtons.html'

Template.voteButtons.onCreated(function(){
	self = this;
	var dict = new ReactiveDict();
	self.templateDictionary = dict;

	if (Meteor.user()) {
		Meteor.call('getUserDelegateVote', proposalId, function(error, result){
			if (error){
				Bert.alert(error.reason, 'danger');
			} else {
				dict.set( 'delegateVote', result.vote );
			}
		})

		Meteor.call('getUserVoteFor', proposalId, Meteor.userId(), function(error, result){
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
			return "mdl-button--colored";
		}
	},
	userNoClass: function(){
		if(Template.instance().templateDictionary.get('userVote') == 'no'){
			return "mdl-button--colored";
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
			vote('yes');
			template.templateDictionary.set('userVote', 'yes');
		} else {
			openSignInModal();
		}
	},

	'click #vote-no' (event, template){
		if (Meteor.user()){
			vote('no');
			template.templateDictionary.set('userVote', 'no');
		} else {
			openSignInModal();
		}
	},
});

function vote(voteString){
	var currentRole = LocalStore.get('currentUserRole');

	if (currentRole == 'Delegate'){
    // Vote as a delegate
    var delegateVote = {vote: voteString, proposalId: FlowRouter.getParam("id")};
    Meteor.call('voteAsDelegate', delegateVote, function(error){
    	if (error){
    		Bert.alert(error.reason, 'danger');
    	} else {
    		Bert.alert(TAPi18n.__('proposals.view.voteCast'), 'success');
    	}
    });
} else {
    // Vote as an individual voter
    var vote = {vote: voteString, proposalId: FlowRouter.getParam("id"), delegateId: ''};
    Meteor.call('vote', vote, function(error){
    	if (error){
    		Bert.alert(error.reason, 'danger');
    	} else {
    		Bert.alert(TAPi18n.__('proposals.view.voteCast'), 'success');
    	}
    });
}
};
