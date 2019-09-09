import { Votes } from '../../../api/votes/Votes.js'
import './proposalCardTest.html'

Template.ProposalCardTest.onCreated(function(){
  //console.log(this.data.style);
  var self = this;
  self.autorun(function(){
    self.subscribe('votes.all');
  })
});

Template.ProposalCardTest.onRendered(function(){

});

Template.ProposalCardTest.events({

});

Template.ProposalCardTest.helpers({
	isVote: function(style){
    if(style=='vote'){
      return true;
    }
    return false;
  },
  isPoll: function(style){
    if(style=='poll'){
      return true;
    }
    return false;
  },
  isPetition: function(style){
    if(style=='petition'){
      return true;
    }
    return false;
  },

  proposalHasImage: function(proposal) {
    if(typeof proposal.hasCover != 'undefined'){
      return proposal.hasCover;
    }
    return false;
  },
  title: function(proposal) {
    var language = TAPi18n.getLanguage();
    var translation = _.find(proposal.content, function(item){ return item.language == language});

    if (translation) {
      var title = translation.title;
      if (title && /\S/.test(title)) {
        return title;
      } else {
        return TAPi18n.__('pages.proposals.list.untitled')
      }
    } else {
      return TAPi18n.__('pages.proposals.list.untranslated')
    }
  },
  abstract: function(proposal){
    var language = TAPi18n.getLanguage();
    var translation = _.find(proposal.content, function(item){ return item.language == language});
    if (translation){
      return truncate(translation.abstract,125);
    }

  },
  canVote: function() {
    return Session.get("canVote");
  },
  proposalStage: function(stage) {
    if(stage.length > 0){
      return stage.charAt(0).toUpperCase() + stage.slice(1);
    }
    return 'stage unknown';
  },
  proposalStatus: function(status) {
    if(status.length > 0){
      return status.charAt(0).toUpperCase() + status.slice(1);
    }
    return 'status unknown';
  },
  tags: function(proposal){
    return Tags.find({_id: {$in: proposal.tags},"authorized" : true});
  },
  userIsAuthor: function(proposalId) {
    var proposal = Proposals.findOne(proposalId);
    return proposal.authorId == Meteor.userId();
  },
  userIsCollaborator: function(proposal) {
    //check if anyone has been invited
    if(typeof proposal.invited != 'undefined'){
      let invitedArray = proposal.invited;
      if(invitedArray.indexOf(Meteor.userId()) > -1){
          //console.log("user match");
          return true;
      }
    }
    return false;
  },
  userId: function(){
    return Meteor.userId();
  },
  yesCount: function(proposalId) {
    var yesCount = Votes.find({proposalId: proposalId, vote: 'yes'}).count();
    return yesCount;
  },
  noCount: function(proposalId) {
    var noCount = Votes.find({proposalId: proposalId, vote: 'no'}).count();
    return noCount;
  },
  abstainCount: function(proposalId) {
    var abstainCount = Votes.find({proposalId: proposalId, vote: 'abstain'}).count();
    return abstainCount;
  },
  yesPercentage: function(proposalId) {
    var yesCount = Votes.find({proposalId: proposalId, vote: 'yes'}).count();
    var totalCount = Votes.find({proposalId: proposalId}).count();
    if (totalCount > 0) {
      return Math.round(yesCount/totalCount * 100);
    } else {
      return 0;
    }
  },
  noPercentage: function(proposalId) {
    var noCount = Votes.find({proposalId: proposalId, vote: 'no'}).count();
    var totalCount = Votes.find({proposalId: proposalId}).count();
    if (totalCount > 0) {
      return Math.round(noCount/totalCount * 100);
    } else {
      return 0;
    }
  },
  abstainPercentage: function(proposalId) {
    var abstainCount = Votes.find({proposalId: proposalId, vote: 'abstain'}).count();
    var totalCount = Votes.find({proposalId: proposalId}).count();
    if (totalCount > 0) {
      return Math.round(abstainCount/totalCount * 100);
    } else {
      return 0;
    }
  },
  hasVotes: function(proposalId) {
    if (Votes.find({proposalId: proposalId}).count() > 0) {
      return true;
    }
  },
  isDraft: function(proposal) {
    if(proposal.stage == 'live'||proposal.status=='approved'){
      return false;
    }
    return true;
  },
  showRetract: function(stage,status){
    if((stage=='submitted')&&(status=='unreviewed')){
      return true;
    }
    return false;
  }
});

function elipseMe(string){
  let length = string.length
  let words = string.split(' ');
  //console.log(words.length);
  //console.log(length);
}

function truncate(input,length) {
  //console.log("input.lenght: " + input.length + ", length: " + length);
   if (input.length > length){
     //console.log("length is greater");
     return input.substring(0,length) + '...';
   }else{
     //console.log("length is not greater");
     return input;
   }

};
