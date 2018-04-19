import './viewProposal.html'
import './signInModal/signInModal.js'
import { Comments } from '../../../api/comments/Comments.js'
import { Proposals } from '../../../api/proposals/Proposals.js'
import RavenClient from 'raven-js';

Template.ViewProposal.onCreated(function(){
  var self = this;

  var dict = new ReactiveDict();
  this.templateDictionary = dict;
  var communityId = LocalStore.get('communityId');

  proposalId = FlowRouter.getParam("id");
  self.autorun(function() {
    self.subscribe('comments', proposalId);
    self.subscribe('users.community', communityId);
    self.subscribe('proposals.one', proposalId, function(error){
      if (error){
        RavenClient.captureException(error);
        Bert.alert(error.reason, 'danger');
      } else {
        proposal = Proposals.findOne({_id: proposalId})
        dict.set( 'createdAt', proposal.createdAt );
        dict.set( '_id', proposal._id);
        dict.set( 'startDate', moment(proposal.startDate).format('YYYY-MM-DD') );
        dict.set( 'endDate', moment(proposal.endDate).format('YYYY-MM-DD') );
        dict.set( 'invited', proposal.invited );
        dict.set( 'authorId', proposal.authorId );
        dict.set( 'stage', proposal.stage );
        dict.set( 'status', proposal.status );
        dict.set( 'signatures', proposal.signatures || []);
      }
    })
  }); 
});

Template.ViewProposal.onRendered(function(language){
  var self = this;
  var clipboard = new Clipboard('#copy-proposal-link');

  clipboard.on('success', function(e) {
    Bert.alert({
      title: TAPi18n.__('pages.proposals.view.alerts.linkToClipboardSuccess'),
      type: 'success',
      style: 'growl-bottom-right',
      icon: 'fa-link'
    });
    e.clearSelection();
  });

  clipboard.on('error', function(e) {
    Bert.alert({
      title: TAPi18n.__('pages.proposals.view.alerts.linkToClipboardFailed'),
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
    if (proposalIsComplete(proposalId)){
      if (window.confirm(TAPi18n.__('pages.proposals.view.confirmSubmit'))){
        Meteor.call('updateProposalStage', proposalId, 'submitted', function(error){
          if (error){
            RavenClient.captureException(error);
            Bert.alert(error.reason, 'danger');
          } else {
            Bert.alert(TAPi18n.__('pages.proposals.view.alerts.proposalSubmitted'), 'success');
            FlowRouter.go('App.proposals');
          }
        });
      }
    } else {
      Bert.alert(TAPi18n.__('pages.proposals.view.alerts.proposalIncomplete'), 'danger');
    }
  },

  'submit #comment-form' (event, template){
    event.preventDefault();

    if (Meteor.user()){
      var comment = {
        message: template.find('#comment-message').value,
        proposalId: proposalId}
      Meteor.call('comment', comment, function(error){
        if(error){
          RavenClient.captureException(error);
          Bert.alert(error.reason, 'danger');
        } else {
          Bert.alert(TAPi18n.__('pages.proposals.view.alerts.commentPosted'), 'success');
          template.find('#comment-message').value = "";
        }
      });
    }  else {
      openSignInModal();
    }
  },

  'click #sign-proposal' (event, template){
    if (Meteor.user()) {
      Meteor.call('toggleSignProposal', proposalId, function(error){
        if (error){
          RavenClient.captureException(error);
          Bert.alert(error.reason, 'danger');
        } else {
          template.templateDictionary.set('signatures', Proposals.findOne({_id: proposalId}).signatures)
        }
      });
    } else {
      openSignInModal();
    }

  }
});

Template.ViewProposal.helpers({
   languages: function() {
    var content = Proposals.findOne(proposalId).content;
    var languages = _.pluck(content, 'language');
    return languages;
  },
  activeClass: function(language){
    var currentLang = TAPi18n.getLanguage();
    if (language == currentLang){
      return 'is-active';
    }
  },
  createdAt: function(){
    return moment(Template.instance().templateDictionary.get( 'createdAt' )).format('MMMM Do YYYY');
  },
  author: function(){
    return Meteor.users.findOne({ _id : Template.instance().templateDictionary.get( 'authorId' )})
  },
  selectedInvites: function() {
    var invited = Template.instance().templateDictionary.get('invited')
    if (invited) {
      return Meteor.users.find({ _id : { $in : invited } });
    }
  },
  comments: function() {
    return Comments.find({proposalId: proposalId},{transform: transformComment, sort: {createdAt: -1}});
  },
  commentUsername: function(userId){
    Meteor.call('getProfile', userId, function(error, result){
      if (error){
        return TAPi18n.__('pages.proposals.view.userNotFound');
      } else {
        profile = result.profile;
        if (profile){
          return profile.username;
        } else {
          return TAPi18n.__('pages.proposals.view.anonymous');
        }
      }
    });
  },
  _id: function() {
    return Template.instance().templateDictionary.get( '_id' );
  },
  isSigned: function(){
    var signatures = Template.instance().templateDictionary.get( 'signatures' );
    return signatures.indexOf( Meteor.userId()) > -1;
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
  showPointsFor: function(){
    results = Template.instance().templateDictionary.get( 'pointsFor' );
    if(results.length > 0){
      return true;
    }
    return false;
  },
  showPointsAgainst: function(){
    results = Template.instance().templateDictionary.get( 'pointsAgainst' );
    if(results.length > 0){
      return true;
    }
    return false;
  },
  pointsFor: function() {
    return Template.instance().templateDictionary.get( 'pointsFor' );
  },
  pointsAgainst: function() {
    return Template.instance().templateDictionary.get( 'pointsAgainst' );
  },
  isInvited: function() {
    return userIsInvited();
  },
  isVotingAsDelegate: function(){
    return (LocalStore.get('currentUserRole') == 'Delegate');
  },
  isVotableForDelegates: function() {
    var startDate = moment(Template.instance().templateDictionary.get( 'startDate' ));
    var endDate = moment(Template.instance().templateDictionary.get( 'endDate' ));
    var now = moment();
    if (endDate.subtract(2,'weeks').isAfter(now) && startDate.isBefore(now)){
      return true;
    } else {
      return false;
    }
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
    var isOpen = ((moment().isAfter(startDate, 'minute')) && (moment().isBefore(endDate, 'minute')))

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
  signatureCount: function(){
    return Template.instance().templateDictionary.get('signatures').length
  }
});

/*///////////////////////////////////////////////////////////////////////////*/

Template.ProposalContent.onCreated(function(){
  var self = this;

  var dict = new ReactiveDict();
  this.templateDictionary = dict;

  proposalId = FlowRouter.getParam("id");
  self.autorun(function() {
    self.subscribe('proposals.one', proposalId, function(error){
      if (error){
        RavenClient.captureException(error);
        Bert.alert(error.reason, 'danger');
      } else {
        proposal = Proposals.findOne({_id: proposalId})
        var languageCode = self.data;
        var allContent = proposal.content;
        var translation = _.find(allContent, function(item){ return item.language == languageCode})
        dict.set( 'title', translation.title || '');
        dict.set( 'abstract', translation.abstract || '' );
        dict.set( 'body', translation.body || '' );
        dict.set( 'pointsFor', translation.pointsFor || [] );
        dict.set( 'pointsAgainst', translation.pointsAgainst || [] );
        dict.set( 'tags', translation.tags || [] );
      }
    })
  }); 
});

Template.ProposalContent.helpers({
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
  showPointsFor: function(){
    results = Template.instance().templateDictionary.get( 'pointsFor' );
    if(results.length > 0){
      return true;
    }
    return false;
  },
  showPointsAgainst: function(){
    results = Template.instance().templateDictionary.get( 'pointsAgainst' );
    if(results.length > 0){
      return true;
    }
    return false;
  },
  pointsFor: function() {
    return Template.instance().templateDictionary.get( 'pointsFor' );
  },
  pointsAgainst: function() {
    return Template.instance().templateDictionary.get( 'pointsAgainst' );
  }
});

function proposalIsComplete(proposalId) {

  proposal = Proposals.findOne(proposalId);
  
  if (!proposal.title){
    return false;
  }
  if (!proposal.abstract){
    return false;
  }
  if (!proposal.body){
    return false;
  }
  if (!proposal.startDate){
    return false;
  }  
  if (!proposal.endDate){
    return false;
  }  

  return true;

}

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
     return _.contains(invited, Meteor.userId());
    }
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
