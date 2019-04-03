import './flags.html'
import { Flags } from '../../../../api/flags/Flags.js'
import { Proposals } from '../../../../api/proposals/Proposals.js'
import { Comments } from '../../../../api/comments/Comments.js'

Template.AdminFlags.onCreated(function(){
  self = this;
  //Local Storage
  var communityId = LocalStore.get('communityId');

  //Reactive Dictionary
  var dict = new ReactiveDict();
  this.templateDictionary = dict;
  dict.set("communityId",LocalStore.get('communityId'));
  //subscriptions
  self.autorun(function() {
    self.subscribe('users.community', communityId);
    self.subscribe("flags.community",communityId);
    self.subscribe("comments.all");
  });
});
/*
Template.AdminFlags.onRendered(function(){

});
*/
Template.AdminFlags.events({
  'click .preview-flag': function(event, template){
    let flagId = event.currentTarget.getAttribute("data-flag-id");
    let flag = Flags.findOne({"_id":flagId});
    if(flag){
      Session.set("flagContent",flag);
      openAdminFlagModal();
    }else{
      Bert.alert('could not find flag', 'danger');
    }
	},
});

Template.AdminFlags.helpers({
	allFlags: function(){
    return distinctFlags({});
  },
  pendingFlags: function(){
    return distinctFlags({"status" : "pending"});
  },
  resolvedFlags: function(){
    return distinctFlags({"status" : "resolved"});
  },
  proposalContent: function(id){
    let content = false;
    let proposal = Proposals.findOne({"_id":id},{sort:{"createdAt":1}});
    if(proposal){
      if(typeof proposal.content !== undefined){
        content = proposal.content;
      }
    }
    return content;
  },
  flagDate: function(){
    console.log(this);
    return moment(this.createdAt).format('MMMM Do YYYY');
  },
});

//===================MODAL=====================
Template.AdminFlagModal.helpers({
  flag: function(){
    let flag = Session.get("flagContent");
    if(flag){
      return flag;
    }
    return flag;
  },
  isProposal: function(type){
    if(type=='proposal'){
      return true;
    }
    return false;
  },
  isComment: function(type){
    if((type=='comment')||(type=='for')||(type=='against')){
      return true;
    }
    return false;
  },
  comment: function(){
    let flag = Session.get("flagContent");
    let id = false;
    if(flag){
      id = flag.contentId;
    }
    let comment = Comments.findOne({"_id":id});
    return comment;
  },
  oldFlagsContent: function(id){
    console.log("id: " + id);
    let flags = Flags.find({"contentId":id,"status" :"resolved"});
    console.log(flags.count());
    return flags;
  }
});

Template.AdminFlagModal.events({
  'click #overlay' (event, template){
    closeAdminFlagModal();
  },
  'click #admin-flag-cancel-button' (event, template){
    closeAdminFlagModal();
  }
})

openAdminFlagModal = function(event) {
  if (event) event.preventDefault();
  $(".flag-modal").addClass('active');
  $("#overlay").addClass('dark-overlay');
}

closeAdminFlagModal = function(event) {
  if (event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
  Session.set("flagContent",false);
  $(".flag-modal").removeClass('active');
  $("#overlay").removeClass('dark-overlay');
}

distinctFlags = function(query){
  //get all falgs that match the query
  let flagsArray = Flags.find(query).fetch();
  //get just the content ids
  let distinctContentIds = _.uniq(flagsArray, false, function(d) {
    return {"_id": d.contentId, "type": d.contentType, "ownerId": d.creatorId};
  });
  let idArray = _.pluck(distinctContentIds, 'contentId');
  //get the distinct contentIds
  let distinctArray = _.uniq(idArray);
  //create an array of flags based on contentIds
  let flagArray = [];
  distinctArray.forEach(function(item, index) {
    let flag = Flags.findOne({"contentId":item});
    if(flag){
      flagArray.push(flag);
    }
  });
  return flagArray;
}
