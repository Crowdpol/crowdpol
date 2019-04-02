import './flagModal.html'
import { Proposals } from '../../../api/proposals/Proposals.js'
import { Comments } from '../../../api/comments/Comments.js'
import { userProfilePhoto, userfullname, username, userTags } from '../../../utils/users';
import RavenClient from 'raven-js';

Template.FlagModal.helpers({
  contentId: function(){
    let flagContent = Session.get("flagContent");
    let contentId = false;
    if(flagContent){
      contentId = flagContent.contentId;
    }else{
      console.log("no flag contentId");
    }
    return contentId;
  },
  authorId: function(){
    let flagContent = Session.get("flagContent");
    let contentAuthor = false;
    if(flagContent){
      contentAuthor = flagContent.contentAuthor;
    }else{
      console.log("no flag author");
    }
    return contentAuthor;
  },
  contentType: function(){
    let flagContent = Session.get("flagContent");
    let contentType = false;
    if(flagContent){
      if(typeof flagContent.contentType !== undefined){
        return flagContent.contentType
      }
    }
    return false;
  },
	flagHeader: function(contentType){
    if(contentType){
      switch (contentType) {
        case 'proposal':
          text = "Report proposal";//{{_ "components.flag-modal.header"}}
          break;
        case 'for':
          text = "Report  argument for";
          break;
        case 'against':
          text = "Report  argument against";
          break;
        case 'comment':
          text = "Report comment";
          break;
        default:
          text = "Could not work out which element you are reporting";
      }
    }else{
      console.log("content type undefined");
    }
    return text;
  },
  isProposal: function(contentType){
    if(contentType=='proposal'){
      return true;
    }
    return false;
  },
  isComment: function(contentType){
    if((contentType=='for')||(contentType=='against')||(contentType=='comment')){
      return true;
    }
    return false;
  },
  proposal: function(id){
    //TAPi18n.getLanguage()
    console.log("proposal id: "+id);
    let content = false;
    let proposal = Proposals.findOne({"_id":id});
    if(proposal){
      if(typeof proposal.content !== undefined){
        content = proposal.content;
      }
    }

    console.log(content);
    return content;
  },
  commentMessage: function(id){
    console.log("proposal id: "+id);
    let message = false;
    let comment = Comments.findOne({"_id":id});
    if(comment){
      if(typeof comment.message){
        message = comment.message;
      }
    }
    return message;
  },
  activeClass: function(language){
    var currentLang = TAPi18n.getLanguage();
    if (language == currentLang){
      return 'is-active';
    }
  },
});

Template.FlagModal.events({
  'click #flag-cancel-button': function(event, template){
    $('#draggable-flag-modal').hide();
  },
  'click .dropdown-item': function(event, template){
		type = event.target.dataset.val
		template.find('#flag-type').dataset.val = type;
		template.find('#flag-type').value = type;
	},
  'click #flag-report-button': function(event, template){
    event.preventDefault();
    let flagContent = Session.get("flagContent");
    let flag = {
      contentType: flagContent.contentType,
      contentId: flagContent.contentId,
      creatorId: flagContent.contentAuthor,
      //flaggerId: Meteor.userId(),
      category: template.find('#flag-type').value,
      other: template.find('#flag-reason').value,
      //justification: '',
      //status: 'pending',
      //outcome: '',
      communityId: LocalStore.get('communityId')
    }
    Meteor.call('addFlag', flag, function(error, result){
      if(error) {
        RavenClient.captureException(error);
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert(TAPi18n.__('components.flag-modal.alert-success'), 'success');
      }
    });
    $('#draggable-flag-modal').hide();
  }
});
