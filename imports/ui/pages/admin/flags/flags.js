import './flags.html';
import { Flags } from '../../../../api/flags/Flags.js'
import { Proposals } from '../../../../api/proposals/Proposals.js'
import { Comments } from '../../../../api/comments/Comments.js'
import RavenClient from 'raven-js';
import { Communities } from '../../../../api/communities/Communities.js'

Template.AdminFlags_TabContent.onCreated(function(){
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
Template.AdminFlags_TabContent.onRendered(function(){

});
*/
Template.AdminFlags_TabContent.events({
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

Template.AdminFlags_TabContent.helpers({
	allFlags: function(){
    return distinctFlags({});
  },
  pendingFlagsCount: function(){
    let array = distinctFlags({"status" : "pending"});
    return array.length;
  },
  pendingFlags: function(){
    return distinctFlags({"status" : "pending"});
  },
  resolvedFlagsCount: function(){
    let array = distinctFlags({"status" : "resolved"});
    return array.length;
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
