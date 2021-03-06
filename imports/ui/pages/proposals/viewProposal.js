import './viewProposal.html'
import './removeInviteModal/removeInviteModal.js'
import './signInModal/signInModal.js'
import { Comments } from '../../../api/comments/Comments.js'
import { Proposals } from '../../../api/proposals/Proposals.js'
import { Tags } from '../../../api/tags/Tags.js'
import { setCoverState } from '../../components/cover/cover.js'
import { urlify,calcReadingTime } from '../../../utils/functions';
import RavenClient from 'raven-js';

Template.NewViewProposal.onCreated(function(language){
  var self = this;
  var dict = new ReactiveDict();
  this.templateDictionary = dict;
  var communityId = LocalStore.get('communityId');
  let proposalId = null;;
  if(self.data.proposalId){
    proposalId = Template.currentData().proposalId;
  }else{
    proposalId = FlowRouter.getParam("id");
  }
  dict.set( 'anonymous', false );
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
        dict.set( 'anonymous', proposal.anonymous || false );
        dict.set( 'startDate', moment(proposal.startDate).format('YYYY-MM-DD') );
        dict.set( 'endDate', moment(proposal.endDate).format('YYYY-MM-DD') );
        dict.set( 'invited', proposal.invited );
        dict.set( 'authorId', proposal.authorId );
        dict.set( 'stage', proposal.stage );
        dict.set( 'status', proposal.status );
        dict.set( 'signatures', proposal.signatures || []);
        dict.set( 'tags', proposal.tags || [] );
        //new cover stuff
        dict.set('coverURL',proposal.coverURL);
        dict.set('coverPosition',proposal.coverPosition);
        //consider deleting the below
        dict.set('hasCover',proposal.hasCover);
        dict.set('eventLogs',proposal.eventLog || []);
        Session.set('hasCover',proposal.hasCover);

        if(proposal.hasCover){
          Session.set('coverPosition',proposal.coverPosition);
          Session.set('coverURL',proposal.coverURL);
          setCoverState('view');
          Session.set('coverState','view');
        }else{
          setCoverState('hidden');
          Session.set('coverState','hidden');
        }

      }
    })
  });
});

Template.NewViewProposal.onRendered(function(language){
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

  this.autorun(function() {

    let hasCover = Template.instance().templateDictionary.get('hasCover');
    if(typeof hasCover != 'undefined'){
  		if(hasCover){
        $('#proposal-view-cover').css("background-image",Template.instance().templateDictionary.get('coverURL'));
        //$('#proposal-view-cover').css("background-position",Template.instance().templateDictionary.get('coverPosition'));
        //$('#proposal-view-cover').addClass("disable-edit");
      }else{
        //$('#proposal-view-cover').hide();
        console.log("do default crowdpol cover")
      }
    }else{
      console.log("hasCover undefined");
    }

  });

});

Template.NewViewProposal.events({
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
    let status = Template.instance().templateDictionary.get('status');
    if(status=='approved'){
      if (window.confirm(TAPi18n.__('pages.proposals.view.confirmEditAfterApproval'))){
        let proposalId = Template.instance().templateDictionary.get('_id');
        FlowRouter.go('App.proposal.edit', {id: proposalId});
      }
    }else{
      let proposalId = Template.instance().templateDictionary.get('_id');
      FlowRouter.go('App.proposal.edit', {id: proposalId});
    }

  },
  'click #publish-proposal' (event, template){
      Meteor.call('updateProposalStage', proposalId, 'live','approved', function(error){
        if (error){
          RavenClient.captureException(error);
          Bert.alert(error.reason, 'danger');
        } else {
          Bert.alert(TAPi18n.__('pages.proposals.view.alerts.proposalPublished'), 'success');
          FlowRouter.go('App.navigator');

        }
      });
  },
  'click #submit-proposal' (event, template){
    let proposalId = Template.instance().templateDictionary.get('_id');
    if (proposalIsComplete(proposalId)){
      if (window.confirm(TAPi18n.__('pages.proposals.view.confirmSubmit'))){
        Meteor.call('updateProposalStage', proposalId, 'submitted','unreviewed', function(error){
          if (error){
            RavenClient.captureException(error);
            Bert.alert(error.reason, 'danger');
          } else {
            Bert.alert(TAPi18n.__('pages.proposals.view.alerts.proposalSubmitted'), 'success');
            FlowRouter.go('App.navigator');

          }
        });
      }
    } else {
      Bert.alert(TAPi18n.__('pages.proposals.view.alerts.proposalIncomplete'), 'danger');
    }
  },
  'submit #comment-form' (event, template){
    event.preventDefault();
    let proposalId = Template.instance().templateDictionary.get('_id');
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
    let proposalId = Template.instance().templateDictionary.get('_id');
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

  },
  'click #back-button' (event, template) {
		event.preventDefault();
    console.log("viewProposals.js back button clicked");
    window.history.back();
	},
});

Template.NewViewProposal.helpers({
  anonymous: function(){
    return true;//Template.instance().templateDictionary.get('anonymous');
  },
  authorId: function(){
    return Template.instance().templateDictionary.get('authorId');
  },
  hasHeader: function(){
    return Template.instance().templateDictionary.get('hasCover');
  },
  backUrl: function(){
    return Session.get('back');
  },
  languages: function() {
    let proposalId = Template.instance().templateDictionary.get('_id');
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
    let proposalId = Template.instance().templateDictionary.get('_id');
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
    //if(showControls()){
      var commentCount = Template.instance().templateDictionary.get( 'commentCount' );
      if(commentCount>0 || userIsInvited()){
        return true;
      }
    //}
    //return false;
  },

  isInvited: function() {
    if(!showControls()){
      return true;
    }
    return userIsInvited();
  },
  isVotingAsDelegate: function(){
    //console.log("isVotingAsDelegate: " + LocalStore.get('currentUserRole'));
    return (LocalStore.get('currentUserRole') == 'delegate');
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
    if(showControls()){
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
    }
    return false;
  },
  isVisible: function() {
    /*
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
    */
    return true;
  },
  getProposalLink: function() {
    //console.log(this.proposalId);
    let proposalId = this.proposalId;
    let origin = window.location.origin;

    if(proposalId){
      return origin + "/proposals/view/" + proposalId;
    }
    return window.location;

  },
  signatureCount: function(){
    return Template.instance().templateDictionary.get('signatures').length
  },
  showEditable: function(){
    return showControls();
  },
  eventLogs: function(){
    let proposalId = null;
    if(self.data.proposalId){
      proposalId = Template.currentData().proposalId;
    }else{
      proposalId = FlowRouter.getParam("id");
    }
    if(proposalId){
      let proposal = Proposals.findOne({"_id":proposalId});
      let eventLogs = proposal.eventLog;
      return eventLogs.reverse();
    }else{
      let eventLogs = Template.instance().templateDictionary.get( 'eventLogs' );
      return eventLogs;
    }
  },
  eventLogCommment: function(){
    return Comments.findOne({"_id":this.commentId});
  },
  eventLogStatus: function(status){
    //allowed status: ['created','updated','comment', 'submitted','returned','rejected','approved','live','invited','signature','against','for','admin'],
    switch(status) {
      case 'created':
        return "Proposal created."
        break;
      case 'updated':
        return "Proposal updated."
        break;
      case 'submitted':
        return "Proposal has been submitted for review."
        break;
      case 'live':
        return "Proposal has been published and is now live.";
        break;
      case 'invited':
        return "New co-author invited.";
        break;
      case 'signature':
        return "Proposal has been signed.";
        break;
      case 'draft':
        return "Proposal has been set to draft.";
        break;
      default:
        return "eventLogStatus - fix this (status=" + status + "): "
    }
  },
  eventLogType: function(status){
    //allowed status: ['created','updated','comment', 'submitted','returned','rejected','approved','live','invited','signature','against','for','admin'],
    switch(status) {
      case 'comment':
        return "Comment: "
        break;
      case 'against':
        return "Arugment against added: "
        break;
      case 'for':
        return "Argument for added: "
        break;
      case 'returned':
        return "Returned by Admin: ";
        break;
      case 'rejected':
        return "Rejected by Admin: ";
        break;
      case 'approved':
        return "Approved by Admin: ";
        break;
      case 'admin':
        return "Comment from Admin: ";
        break;
      default:
        return "eventLogType - fix this (status=" + status + "): "
    }
  },
  isAdminProposalView: function(){
    return isAdmin();
  },
  statusApproved: function(status){
    //console.log("status: " + status);
    status = Template.instance().templateDictionary.get('status');
    //console.log("status: " + status);
    if(status=='approved'){
      return true;
    }
    return false;
  },
  urlifyMessage: function(message){
    return urlify(message);
  }
});

Template.ProposalContent.onCreated(function(language){

  var self = this;

  var dict = new ReactiveDict();
  this.templateDictionary = dict;

  let proposalId = null;
  if(typeof Template.currentData().proposalId!==undefined){
    proposalId = Template.currentData().proposalId;
  }else{
    proposalId = FlowRouter.getParam("id");
  }
  dict.set('proposalId',proposalId);
  self.autorun(function() {
    self.subscribe('proposals.one', proposalId, function(error){
      if (error){
        RavenClient.captureException(error);
        Bert.alert(error.reason, 'danger');
      } else {
        proposal = Proposals.findOne({_id: proposalId})
        var languageCode = self.data.language;
        var allContent = proposal.content;
        var translation = _.find(allContent, function(item){ return item.language == languageCode})
        dict.set( 'language', languageCode || '');
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
  getAvatar: function(authorId){
    var user = Meteor.users.findOne(authorId);
    return user.profile.photo;
  },
  readingTimeText: function(){
    let body = Template.instance().templateDictionary.get( 'body' );
    if(body==undefined||body.length==0){
      //retrun// TAPi18n.__('pages.proposals.view.body-empty') + "</i>";
    }else{
      readTime = calcReadingTime(body);
      return TAPi18n.__('pages.proposals.view.read-time',{readTime:readTime});
    }
  },
  body: function() {
    var body = Template.instance().templateDictionary.get( 'body' );
    if(body==undefined||body.length==0){
      return "<i>" + TAPi18n.__('pages.proposals.view.body-empty') + "</i>";
    }
    return body;
  },
  argumentsFor: function() {
    let language = Template.instance().templateDictionary.get('language');
    let proposalId = Template.instance().templateDictionary.get('proposalId');
    return Comments.find({proposalId:proposalId,type:'for',language: language});
    //return Template.instance().templateDictionary.get( 'argumentsFor' );
  },
  argumentsForCount: function() {
    let language = Template.instance().templateDictionary.get('language');
    let proposalId = Template.instance().templateDictionary.get('proposalId');
    return Comments.find({proposalId:proposalId,type:'for',language: language}).count();
    //return Template.instance().templateDictionary.get( 'argumentsFor' );
  },
  argumentsAgainst: function(l) {
    let language = Template.instance().templateDictionary.get('language');
    let proposalId = Template.instance().templateDictionary.get('proposalId');
    return Comments.find({proposalId:proposalId,type:'against',language: language});
    //return Template.instance().templateDictionary.get( 'argumentsAgainst' );
  },
  argumentsAgainstCount: function(l) {
    let language = Template.instance().templateDictionary.get('language');
    let proposalId = Template.instance().templateDictionary.get('proposalId');
    return Comments.find({proposalId:proposalId,type:'against',language: language}).count();
    //return Template.instance().templateDictionary.get( 'argumentsAgainst' );
  },
  status: function() {
    return Template.instance().templateDictionary.get( 'status' );
  },
  stage: function() {
    return Template.instance().templateDictionary.get( 'stage' );
  },
  language: function(){
    if(this){
      if(typeof this.language !== 'undefined'){
        return this.language;
      }
    }
  },
  showEditable: function(){
    return showControls();
  }
});

Template.ProposalContent.events({
  'click .close-comment' (event, template){
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
      let identifier = "[data-buttons-id='" + commentId + "'].owner-buttons";
      $(identifier).show();
    }else{
      let identifier = "[data-buttons-id='" + commentId  + "'].viewer-buttons";
      $(identifier).show();
    }
  },
  'mouseleave .comment': function(e) {
    let commentId = e.currentTarget.getAttribute("data-comment-id");
    if(checkIfOwner(commentId)){
      let identifier = "[data-buttons-id='" + commentId  + "'].owner-buttons";
      $(identifier).hide();
    }else{
      let identifier = "[data-buttons-id='" + commentId  + "'].viewer-buttons";
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
  if (content.abstract){
    let abstract = content.abstract;
    if((abstract.length<50)||(abstract.length>280)){
      return false;
    }
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

function showControls(){
  var hostname = window.location.pathname;
  var res = hostname.substr(1, 5);
  if(res=='admin'){
    //console.log("showControls is false");
    return false;
  }
  //console.log("showControls is true");
  return true;
}

function isAdmin(){
  let adminProposalView = Session.get('adminProposalView');
  if(adminProposalView){
    return true;
  }
  return false;
}
