import './flags.html'
import { Flags } from '../../../../api/flags/Flags.js'
import { Proposals } from '../../../../api/proposals/Proposals.js'

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
    return Flags.find();
  },
  pendingFlags: function(){
    return Flags.find({"status" : "pending"});
  },
  resolvedFlags: function(){
    return Flags.find({"status" : "resolved"});
  },
  proposalContent: function(id){
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
  flagDate: function(){
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
    if(type=='comment'){
      return true;
    }
    return false;
  },
  isArgument: function(type){
    if((type=='for')||(type=='against')){
      return true;
    }
    return false;
  }

});

Template.AdminFlagModal.events({
  'click #overlay' (event, template){
    console.log("overlay clicked");
    closeAdminFlagModal();
  }
})

openAdminFlagModal = function(event) {
  if (event) event.preventDefault();
  $(".proposal-modal").addClass('active');
  $("#overlay").addClass('dark-overlay');
}

closeAdminFlagModal = function(event) {
  if (event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
  Session.set("flagContent",false);
  $(".proposal-modal").removeClass('active');
  $("#overlay").removeClass('dark-overlay');
}
