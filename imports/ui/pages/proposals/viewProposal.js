import './viewProposal.html'
import { Comments } from '../../../api/comments/Comments.js'
import { Proposals } from '../../../api/proposals/Proposals.js'

Template.ViewProposal.onCreated(function(){

  var self = this;
  self.delegates = new ReactiveVar([]);
  self.delegateVote = new ReactiveVar();
  var dict = new ReactiveDict();
  this.templateDictionary = dict;

  proposalId = FlowRouter.getParam("id");
  self.autorun(function() {
    self.subscribe('comments', proposalId);
    self.subscribe('users.all');
    self.subscribe('proposals.one', proposalId, function(error){
      if (error){
        Bert.alert(error.reason, 'danger');
      } else {
        proposal = Proposals.findOne({_id: proposalId})
        dict.set( 'title', proposal.title );
        dict.set( 'abstract', proposal.abstract );
        dict.set( 'body', proposal.body );
        dict.set( 'startDate', moment(proposal.startDate).format('YYYY-MM-DD') );
        dict.set( 'endDate', moment(proposal.endDate).format('YYYY-MM-DD') );
        dict.set( 'invited', proposal.invited );
        dict.set( 'authorId', proposal.authorId );
        dict.set( 'stage', proposal.stage );
        dict.set( 'status', proposal.status );
        dict.set( 'tags', proposal.tags );
        dict.set( 'signatures', proposal.signatures || [] );
      }
    })
  });

  Meteor.call("getDelegateVotes", function(error, result){
    if (error){
      Bert.alert(error.reason, 'danger');
    } else {
      self.delegates.set(result);
    }
  });

  Meteor.call('getUserDelegateVote', proposalId, function(error, result){
    if (error){
      Bert.alert(error.reason, 'danger');
    } else {
      self.delegateVote.set(result);
    }
  })

   Meteor.call('getUserVoteFor', proposalId, Meteor.userId(), function(error, result){
      if (result){
        dict.set( 'userVote', result.vote );
      } else {
        dict.set( 'userVote', '' );
      }
    });
});

Template.ViewProposal.onRendered(function(){
  var self = this;
  var clipboard = new Clipboard('#copy-proposal-link');

  clipboard.on('success', function(e) {
    Bert.alert({
      title: 'Link copied to clipboard',
      type: 'success',
      style: 'growl-bottom-right',
      icon: 'fa-link'
    });
    e.clearSelection();
  });

  clipboard.on('error', function(e) {
    Bert.alert({
      title: 'Could not copy to clipboard',
      message: e.action + "; " + e.trigger,
      type: 'warning',
      style: 'growl-bottom-right',
      icon: 'fa-link'
    });
  });

});

Template.ViewProposal.events({
  'click #edit-proposal' (event, template){
    FlowRouter.go('App.proposal.edit', {id: proposalId});
  },
  'click #submit-proposal' (event, template){
    if (window.confirm(TAPi18n.__('proposals.view.confirmSubmit'))){
      Meteor.call('updateProposalStage', proposalId, 'submitted', function(error){
        if (error){
          Bert.alert(error.reason, 'danger');
        } else {
          Bert.alert('Proposal submitted for admin approval', 'success');
          FlowRouter.go('App.proposals');
        }
      });
    }
  },

  'submit #comment-form' (event, template){
    var comment = {
      message: template.find('#comment-message').value,
      proposalId: proposalId}
    Meteor.call('comment', comment, function(error){
      if(error){
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Comment posted', 'success');
      }
    });
  },

  'click #vote-yes' (event, template){
    vote('yes');
    template.templateDictionary.set('userVote', 'yes');
  },

  'click #vote-no' (event, template){
    vote('no');
    template.templateDictionary.set('userVote', 'no');
  },

  'click #sign-proposal' (event, template){
    Meteor.call('toggleSignProposal', proposalId, function(error){
      if (error){
        Bert.alert(error.reason, 'danger');
      } else {
        template.templateDictionary.set('signatures', Proposals.findOne({_id: proposalId}).signatures)
      }
    });
    
  }
});

Template.ViewProposal.helpers({

  comments: function() {
    return Comments.find({proposalId: proposalId},{transform: transformComment, sort: {createdAt: -1}});
  },
  commentUsername: function(userId){
    Meteor.call('getProfile', userId, function(error, result){
      if (error){
        return 'User could not be found';
      } else {
        profile = result.profile;
        if (profile){
          return profile.username;
        } else {
          return 'Anonymous';
        }
      }
    });
  },
  title: function() {
    return Template.instance().templateDictionary.get( 'title' );
  },
  tags: function() {
    return Template.instance().templateDictionary.get( 'tags' );
  },
  abstract: function() {
    return Template.instance().templateDictionary.get( 'abstract' );
  },
  body: function() {
    return Template.instance().templateDictionary.get( 'body' );
  },
  status: function() {
    return Template.instance().templateDictionary.get( 'status' );
  },
  startDate: function() {
    return Template.instance().templateDictionary.get( 'startDate' );
  },
  endDate: function() {
    return Template.instance().templateDictionary.get( 'endDate' );
  },
  isInvited: function() {
    return userIsInvited();
  },
  isVotingAsDelegate: function(){
    return (Session.get('currentUserRole') == 'Delegate');
  },
  isAuthor: function() {
    return userIsAuthor();
  },
  isLive: function() {
    return proposalIsLive();
  },
  isSubmittable: function(){
    return (userIsAuthor() && Template.instance().templateDictionary.get( 'stage' ) == 'draft')
  },
  isEditable: function(){
    return (userIsAuthor() && !proposalIsLive())
  },
  signatureIcon: function(){
    if (Template.instance().templateDictionary.get('signatures').includes(Meteor.userId())){
      return 'star'
    } else {
      return 'star_border'
    }
  },
  isVotable: function(){
    var stage = Template.instance().templateDictionary.get('stage');
    var status = Template.instance().templateDictionary.get('status');
    var startDate = Template.instance().templateDictionary.get('startDate');
    var endDate = Template.instance().templateDictionary.get('endDate');
    var isOpen = ((moment().isAfter(startDate, 'day')) && (moment().isBefore(endDate, 'day')))

    //Should be live, approved and between the start and end dates
    if ((stage == 'live') && (status == 'approved') && (isOpen)) {
      return true;
    } else {
      return false;
    }
  },
  isVisible: function() {
    //Proposal should be visible to admin if submitted
    if ((Roles.userIsInRole(Meteor.userId(), 'admin')) && (Template.instance().templateDictionary.get('stage') == 'submitted')){
      return true;
    } else {
      // Proposal should be visible to everyone if live, 
      //or if not live, to authors and invited users
      if (proposalIsLive() || userIsAuthor() || userIsInvited()){
        return true;
      } else {
        return false;
      }
    }
  },
  getProposalLink: function() {
    return Meteor.absoluteUrl() + "proposals/view/" + proposalId;
  },
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
    if (Template.instance().delegateVote.get() == 'yes'){
      return 'delegate-color'
    }
  },
  delegateNoClass: function(){
    if (Template.instance().delegateVote.get() == 'no'){
      return 'delegate-color'
    }
  },
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
  }
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

function userIsAuthor(){
  if (Meteor.userId() == Template.instance().templateDictionary.get( 'authorId' )){
      return true;
    } else {
      return false;
    }
}

function userIsInvited(){
  // If the user is the author, they have all the same access rights as contributors

  if (userIsAuthor()){
    return true;
  } else {
    invited = Template.instance().templateDictionary.get( 'invited' );
    if (invited) {
      for (i=0; i<invited.length; i++){
        if (Meteor.user().profile.username == invited[i]) {
          return true;
        }
      }
    }
    return false;
  }
};

function proposalIsLive(){
  if (Template.instance().templateDictionary.get( 'stage' ) == 'live'){
      return true;
    } else {
      return false;
    }
};

function transformComment(comment) {
    var user = Meteor.users.findOne(comment.authorId);
    if (user) {
        var username = user.profile.username;
        var avatar = user.profile.photo;
        var date = moment(comment.createdAt).format('MMMM Do YYYY, h:mm:ss a');
        comment.username = username;
        comment.avatar = avatar;
        comment.date = date;
    }
    return comment;
};

function vote(voteString){
  var currentRole = Session.get('currentUserRole');

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

