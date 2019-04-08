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
    //console.log(this);
    return moment(this.createdAt).format('MMMM Do YYYY');
  },
});

//===================MODAL=====================
Template.AdminFlagContentModal.onCreated(function(){
  self = this;
  self.selectedFlag = new ReactiveVar(false);
});
Template.AdminFlagContentModal.helpers({
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
  isFirst: function(index,flagId){
    console.log("index: " + index + " flagId: " + flagId);
    if(index==0){
      Template.instance().selectedFlag.set(flagId);
      return 'selected';
    }
  },
  oldFlagsContent: function(id){
    let flags = Flags.find({"contentId":id}).fetch();
    return flags;
  },
  oldFlagsUser: function(id){
    let flags = Flags.find({"creatorId":id});
    return flags;
  },
  flagDate: function(date){
    return moment(date).format('MMMM Do YYYY');
  },
  flagDetails: function(){
    let flagId = Template.instance().selectedFlag.get();
    return Flags.findOne({"_id":flagId});
  }
});

Template.AdminFlagContentModal.events({
  'click #overlay' (event, template){
    closeAdminFlagModal();
  },
  'click #admin-flag-cancel-button' (event, template){
    closeAdminFlagModal();
  },
  'click .flag-row' (event, template){
    let id = event.currentTarget.getAttribute("data-row-flag-id");
    if(id){
      $(".flag-row").each(function(){
        $(this).removeClass("selected");
      });
      let selector = "[data-row-flag-id='"+id+"']";
      $(selector).addClass("selected");
      let flag = Flags.findOne({"_id":id});
      $("#flag-reported-reason").html(flag.category);
      $("#flag-reported-other").html(flag.other);
      Template.instance().selectedFlag.set(id);
    }
  },
  'click #select-all' (event, template){
    if(!$(event.currentTarget).hasClass("checked")){
      $(".flag-row").each(function(){
        $(this).addClass("selected");
      });
      $("#flag-reported-reason").html("all selected");
      $("#flag-reported-other").html("all selected");
    }else{
      $(".flag-row").each(function(){
        $(this).removeClass("selected");
      });
      let flagId = Template.instance().selectedFlag.get();
      let selector = "[data-row-flag-id='"+flagId+"']";
      $(selector).addClass("selected");
      let flag = Flags.findOne({"_id":flagId});
      $("#flag-reported-reason").html(flag.category);
      $("#flag-reported-other").html(flag.other);
    }
    $(event.currentTarget).toggleClass("checked");
  },
  'click #flag-report-button' (event, template){
    let outcome = $('input[name="content-action"]:checked').val()

    console.log();
    console.log($('#flag-response-justification').val());
  }
})

openAdminFlagModal = function(event) {
  if (event) event.preventDefault();
  $(".flag-content-modal").addClass('active');
  $("#overlay").addClass('dark-overlay');
}

closeAdminFlagModal = function(event) {
  if (event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
  Session.set("flagContent",false);
  $(".flag-content-modal").removeClass('active');
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
