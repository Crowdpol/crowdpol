import './viewProposal.html'
import { Comments } from '../../../api/comments/Comments.js'

Template.ViewProposal.onCreated(function(){

  var self = this;

  proposalId = FlowRouter.getParam("id");
  self.autorun(function() {
    self.subscribe('comments', proposalId);
    self.subscribe('users');
  });

  var dict = new ReactiveDict();

  Meteor.call('getProposal',proposalId,function(error,result){
    if (error){
      Bert.alert(error.reason, 'danger');
    }else{
      dict.set( 'title', result.title );
      dict.set( 'abstract', result.abstract );
      dict.set( 'body', result.body );
      dict.set( 'startDate', moment(result.startDate).format('YYYY-MM-DD') );
      dict.set( 'endDate', moment(result.endDate).format('YYYY-MM-DD') );
      dict.set( 'invited', result.invited );
      dict.set( 'authorId', result.authorId );
      dict.set( 'stage', result.stage );
      dict.set( 'status', result.status );
    }
  });
  this.templateDictionary = dict;
});

Template.ViewProposal.onRendered(function(){
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
    Meteor.call('updateProposalStage', proposalId, 'submitted', function(error){
      if (error){
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Proposal submitted for admin approval', 'success');
      }
    });
  },
  'submit #comment-form' (event, template){
    var comment = {
      message: template.find('#comment-message').value,
      authorId: Meteor.userId(),
      proposalId: proposalId}
    Meteor.call('comment', comment, function(error){
      if(error){
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Comment posted', 'success');
      }
    });
  }
});

Template.ViewProposal.helpers({

  comments: function() {
    return Comments.find({proposalId: proposalId},{transform: transformComment});
  },
  commentUsername: function(userId){
    console.log('calling the function with' + userId)
    Meteor.call('getProfile', userId, function(error, result){
      if (error){
        return 'User could not be found';
      } else {
        console.log('success so far')
        profile = result.profile;
        if (profile){
          return profile.username;
        } else {
          return 'Anonymous';
          console.log('the user is anon')
        }
      }
    });
  },
  title: function() {
    return Template.instance().templateDictionary.get( 'title' );
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
});

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
}

function proposalIsLive(){
  if (Template.instance().templateDictionary.get( 'stage' ) == 'live'){
      return true;
    } else {
      return false;
    }
}

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

