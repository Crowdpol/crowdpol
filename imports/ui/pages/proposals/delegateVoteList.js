import './delegateVoteList.html'

Template.delegateVoteList.onCreated(function(){
	self = this;
	var dict = new ReactiveDict();
	this.templateDictionary = dict;
	self.delegates = new ReactiveVar([]);
	proposalId = FlowRouter.getParam("id");
	if (Meteor.user()) {
	    Meteor.call("getDelegateVotes", proposalId, Meteor.userId(), function(error, result){
	      if (error){
	        Bert.alert(error.reason, 'danger');
	      } else {
	        self.delegates.set(result);
	      }
	    });
  	}
	
});

Template.delegateVoteList.helpers({
	delegatesFor: function(){
    var delegates = Template.instance().delegates.get();
    var delegatesFor = [];
    _.map(delegates, function(delegate){
      if (delegate.vote_info[0].vote == 'yes'){
        delegatesFor.push(delegate);
      }
    });
    return delegatesFor;
  },
  delegatesAgainst: function(){
    var delegates = Template.instance().delegates.get();
    var delegatesAgainst = [];
    _.map(delegates, function(delegate){
      if (delegate.vote_info[0].vote == 'no'){
        delegatesAgainst.push(delegate);
      }
    });
    return delegatesAgainst;
  },
	
});


Template.delegateVoteListItem.helpers({
  voteIcon: function(vote){
    if (vote=='yes'){
      return 'check_circle'
    } else if (vote=='no'){
      return 'cancel'
    }
  }
})