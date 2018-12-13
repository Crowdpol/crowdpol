import './viewProposal.html'
import './removeInviteModal/removeInviteModal.js'
import './signInModal/signInModal.js'
import { Comments } from '../../../api/comments/Comments.js'
import { Proposals } from '../../../api/proposals/Proposals.js'
import { Tags } from '../../../api/tags/Tags.js'
import RavenClient from 'raven-js';

Template.ViewProposal.onCreated(function(language){
  var self = this;
  var dict = new ReactiveDict();
  this.templateDictionary = dict;
  var communityId = LocalStore.get('communityId');

  proposalId = FlowRouter.getParam("id");
  self.autorun(function() {
    self.subscribe('comments', proposalId, function(error){
      dict.set('commentCount',Comments.find({proposalId: proposalId}).count());
    });
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
        dict.set( 'tags', proposal.tags || [] );
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
  'click .minilogo, click .proposal-author' (event,template){
    Session.set('drawerId',Template.instance().templateDictionary.get( 'authorId' ));
    if($('.mdl-layout__drawer-right').hasClass('active')){
      $('.mdl-layout__drawer-right').removeClass('active');
    }else{
      $('.mdl-layout__drawer-right').addClass('active');
    }
  },
  'click .collab-author' (event,template){
    if(this._id==Meteor.userId()){
      console.log("deleting this person");
      openRemoveInviteModal();
    }else{
      Session.set('drawerId',this._id);
      if($('.mdl-layout__drawer-right').hasClass('active')){
        $('.mdl-layout__drawer-right').removeClass('active');
      }else{
        $('.mdl-layout__drawer-right').addClass('active');
      }
    }
  },
  'click #edit-proposal' (event, template){
    FlowRouter.go('App.proposal.edit', {id: proposalId});
  },
  'click #submit-proposal' (event, template){
    if (proposalIsComplete(proposalId)){
      if (window.confirm(TAPi18n.__('pages.proposals.view.confirmSubmit'))){
        Meteor.call('updateProposalStage', proposalId, 'submitted','unreviewed', function(error){
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
        proposalId: proposalId,
        authorId: Meteor.user()._id,
        type: 'comment'
      }
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
  backUrl: function(){
    return Session.get('back');
  },
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
  isCurrentUser: function(id){
    if(this._id==Meteor.userId()){
      return true;
    }
    return false;
  },
  comments: function() {
    return Comments.find({proposalId: proposalId,type:'comment'},{transform: transformComment, sort: {createdAt: -1}});
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

  startDate: function() {
    return Template.instance().templateDictionary.get( 'startDate' );
  },
  endDate: function() {
    return Template.instance().templateDictionary.get( 'endDate' );
  },
  tags: function() {
    let tagsArray = Template.instance().templateDictionary.get( 'tags' );
    if(userIsAuthor()){
      return Tags.find({_id: {$in: tagsArray}});
    }
    return Tags.find({_id: {$in: tagsArray},"authorized" : true});
  },
  isAuthorised: function(tag){
    if(tag.authorized){
      return 'tag-authorised';
    }else{
      return 'tag-not-authorised';
    }
  },
  showComments(){
    var commentCount = Template.instance().templateDictionary.get( 'commentCount' );
    if(commentCount>0 || userIsInvited()){
      return true;
    }
    return false;
  },
  isInvited: function() {
    return userIsInvited();
  },
  isVotingAsDelegate: function(){
    return (LocalStore.get('currentUserRole') == 'Delegate');
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
    return ((userIsAuthor()||userIsInvited()) && !proposalIsLive())
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
    //Proposals should be visible to superadmin at all times
    if(Roles.userIsInRole(Meteor.userId(), 'superadmin')){
      return true;
    }
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
    return window.location.href;
  },
  signatureCount: function(){
    return Template.instance().templateDictionary.get('signatures').length
  }
});

Template.ProposalContent.onCreated(function(language){
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
        dict.set( 'status', proposal.status );
        //dict.set('argumentsFor',Comments.find({proposalId:FlowRouter.getParam("id"),type:'against',language: language}))
      }
    })
  });
});

Template.ProposalContent.helpers({
  authorName(authorId){
		let name = "";
		let user = Meteor.users.findOne({"_id":authorId});
		if(typeof user != 'undefined'){
			let profile = user.profile;

			if(typeof profile != 'undefined'){
				if('firstName' in profile){
					name+=profile.firstName + " ";
				}
				if('lastName' in profile){
					name+=profile.lastName;
				}
				/*
				if('username' in profile){
					name+="(" + profile.username + ")";
				}*/
				return name;
			}
		}
    return "admin";
  },
  argumentDate(lastModified){
    lastUpdated = moment(lastModified).fromNow();
    return lastUpdated;
  },
  isAuthor: function() {
    return userIsAuthor();
  },
  title: function() {
    var title =  Template.instance().templateDictionary.get( 'title' );
    if(title==undefined||title.length==0){
      return "<i>" + TAPi18n.__('pages.proposals.view.title-empty') + "</i>";
    }
    return title;
  },
  abstract: function() {
    var abstract = Template.instance().templateDictionary.get( 'abstract' );
    if(abstract==undefined||abstract.length==0){
      return "<i>" + TAPi18n.__('pages.proposals.view.abstract-empty') + "</i>";
    }
    return abstract;
  },
  showAdminComments: function(){
    let status = Template.instance().templateDictionary.get( 'status' )
    if(status=="rejected"){
      return true;
    }
    return false;
  },
  adminComments: function(status){
    return Comments.find({proposalId:FlowRouter.getParam("id"),type:'admin',closed:false});
  },
  invitationDeclinedComments: function(status){
    return Comments.find({proposalId:FlowRouter.getParam("id"),type:'invite-rejection',closed:false});
  },
  body: function() {
    var body = Template.instance().templateDictionary.get( 'body' );
    if(body==undefined||body.length==0){
      return "<i>" + TAPi18n.__('pages.proposals.view.body-empty') + "</i>";
    }
    return body;
  },
  argumentsFor: function() {
    let language = this.toString();
    return Comments.find({proposalId:FlowRouter.getParam("id"),type:'for',language: language});
    //return Template.instance().templateDictionary.get( 'argumentsFor' );
  },
  argumentsAgainst: function() {
    let language = this.toString();
    return Comments.find({proposalId:FlowRouter.getParam("id"),type:'against',language: language});
    //return Template.instance().templateDictionary.get( 'argumentsAgainst' );
  },
  status: function() {
    return Template.instance().templateDictionary.get( 'status' );
  },
  language: function(){
    return this;
  }
});

Template.ProposalContent.events({
  'click .close-comment' (event, template){
    console.log(this._id);
    let commentId = event.currentTarget.getAttribute("data-id");
    //if(checkIfOwner(commentId)){
      Meteor.call('closeComment', commentId, function(error){
        if (error){
          RavenClient.captureException(error);
          Bert.alert(error.reason, 'danger');
        } else {
          Bert.alert(TAPi18n.__('pages.proposals.view.alerts.commentClosed'), 'success');
        }
      });
    //}
  }
});

Template.Comment.events({
  'mouseenter .comment': function(e) {
    let commentId = e.currentTarget.getAttribute("data-comment-id");
    if(checkIfOwner(commentId)){
      let identifier = "[data-buttons-id='" + commentId + "']";
      $(identifier).show();
    }
  },
  'mouseleave .comment': function(e) {
    let commentId = e.currentTarget.getAttribute("data-comment-id");
    if(checkIfOwner(commentId)){
      let identifier = "[data-buttons-id='" + commentId  + "']";
      $(identifier).hide();
    }
  },
  'click .delete-comment-button' (event, template){
    let commentId = event.currentTarget.getAttribute("data-id");
    if(checkIfOwner(commentId)){
      Meteor.call('deleteComment', commentId, function(error){
        if (error){
          RavenClient.captureException(error);
          Bert.alert(error.reason, 'danger');
        } else {
          Bert.alert(TAPi18n.__('pages.proposals.view.alerts.commentDeleted'), 'success');
        }
      });
    }
  },
  'click .close-comment' (event, template){
    console.log(this._id);
    let commentId = event.currentTarget.getAttribute("data-id");
    //if(checkIfOwner(commentId)){
      Meteor.call('closeComment', commentId, function(error){
        if (error){
          RavenClient.captureException(error);
          Bert.alert(error.reason, 'danger');
        } else {
          Bert.alert(TAPi18n.__('pages.proposals.view.alerts.commentClosed'), 'success');
        }
      });
    //}
  },
  'click .edit-comment-button' (event, template){
    let commentId = event.currentTarget.getAttribute("data-id");
    if(checkIfOwner(commentId)){
      let commentTextAreaId = "[data-comment-textarea-id='" + commentId + "']";
      let commentMessageId = "[data-comment-message-id='" + commentId + "']";
      $(commentTextAreaId).show();
      $(commentMessageId).hide();
    }
  },
  'click .close-comment-button' (event, template){
    let commentId = event.currentTarget.getAttribute("data-id");
    if(checkIfOwner(commentId)){
      let commentTextAreaId = "[data-comment-textarea-id='" + commentId + "']";
      let commentMessageId = "[data-comment-message-id='" + commentId + "']";
      $(commentTextAreaId).hide();
      $(commentMessageId).show();
    }
  },
  'click .save-comment-button' (event, template){
    let commentId = event.currentTarget.getAttribute("data-id");
    if(checkIfOwner(commentId)){
      let commentUpdateMessageId = "[data-textarea-id='" + commentId + "']";
      let message = $(commentUpdateMessageId).val();
      Meteor.call('updateComment', commentId, message, function(error){
        if (error){
          RavenClient.captureException(error);
          Bert.alert(error.reason, 'danger');
        } else {
          Bert.alert(TAPi18n.__('pages.proposals.view.alerts.commentUpdated'), 'success');
          let commentTextAreaId = "[data-comment-textarea-id='" + commentId + "']";
          let commentMessageId = "[data-comment-message-id='" + commentId + "']";
          $(commentTextAreaId).hide();
          $(commentMessageId).show();
        }
      });
    }
  }
});

function proposalIsComplete(proposalId) {

  var proposal = Proposals.findOne(proposalId);

  // A Proposal is complete if it exists in at least one of the languages
  var content = proposal.content[0];

  if (!content){
    return false;
  }
  if (!content.title){
    return false;
  }
  if (!content.abstract){
    return false;
  }
  if (!content.body){
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

function checkIfOwner(commentId){
  let comment = Comments.findOne({_id: commentId});
  if(typeof comment != 'undefined'){
    let authorId = comment.authorId;
    if(Meteor.user()._id == authorId){
      return true;
    }
  }
  return false;
}
