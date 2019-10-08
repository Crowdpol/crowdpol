import { Meteor } from 'meteor/meteor';
import "./delegate.html"
import "./communityDelegates.html";
import { Ranks } from '../../../api/ranking/Ranks.js'
import { Tags } from '../../../api/tags/Tags.js'
import RavenClient from 'raven-js';
import { walkThrough } from '../../../utils/functions';

//----------------------------------------------------------------------------------------------//
Template.CommunityDelegates.onCreated(function () {
  var communityId = LocalStore.get('communityId');
  Session.set('searchPhrase','');

  var self = this;
  self.ranks = new ReactiveVar([]);

  self.autorun(function() {
    self.subscribe("simpleSearch",Session.get('searchPhrase'),"delegate", communityId);
    self.subscribe('ranks.currentUser', communityId);
    self.subscribe('tags.community', LocalStore.get('communityId'));
    // Set user's ranked delegates
    if(Meteor.userId()){
      //console.log("calling getRanks, should happen every time a community is updated");
      Meteor.call('getRanks', Meteor.userId(), "delegate", LocalStore.get('communityId'), function(error, result){
        if(error) {
          RavenClient.captureException(error);
          Bert.alert(error.reason, 'danger');
        } else {
          Session.set('ranked', result);
          //dict.set('ranked',result);
        }
      });
    }

  });
});
Template.CommunityDelegates.onRendered(function () {

});
Template.CommunityDelegates.helpers({
  delegatesCount: function() {
    /* DO NOT SHOW CURRENT USER IN DELEGATE SEARCH
    delegates = Meteor.users.find( { $and: [
      { _id : { $nin : Session.get('ranked')}},
      { _id : { $ne: Meteor.userId()} }
    ]});
    */
    let ranked = Session.get('ranked');
    let delegatesCount = 0;
    var communityId = LocalStore.get('communityId');
    if(Array.isArray(ranked)){
      delegatesCount = Meteor.users.find( { $and: [
        { _id : { $nin : ranked}},
        {"roles":"delegate","profile.delegateCommunities":communityId}
      ]}).count()
    }else{
      delegatesCount = Meteor.users.find({"roles":"delegate","profile.delegateCommunities":communityId}).count();
    }
    return delegatesCount;
  },
  delegates: function() {
    /* DO NOT SHOW CURRENT USER IN DELEGATE SEARCH
    delegates = Meteor.users.find( { $and: [
      { _id : { $nin : Session.get('ranked')}},
      { _id : { $ne: Meteor.userId()} }
    ]});
    */
    let delegates = [];
    let ranked = Session.get('ranked');
    var communityId = LocalStore.get('communityId');
    if(Array.isArray(ranked)){
      delegates = Meteor.users.find( { $and: [
        { _id : { $nin : ranked}},
        {"roles":"delegate","profile.delegateCommunities":communityId}
      ]})
    }else{

      delegates = Meteor.users.find({"roles":"delegate","profile.delegateCommunities":communityId});
    }
    /*
    delegates = Meteor.users.find( { $and: [
      { _id : { $nin : Session.get('ranked')}}
    ]});
    */
    return delegates;
  },
  filteredRoles: function(roles){
    return getFilteredRoles(roles);
  },
  showTags: function(tags){
    if(typeof tags != 'undefined'){
      if(Array.isArray(tags)){
        if(tags.length){
          return Tags.find({"_id":{$in:tags}});
        }
      }
    }
    return [];
  },
});
Template.CommunityDelegates.events({
  'click .delegate-view': function(event, template){
    console.log(".delegate-view selected");
    Session.set('drawerId',this._id);
    if($('.mdl-layout__drawer-right').hasClass('active')){
        $('.mdl-layout__drawer-right').removeClass('active');
     }
     else{
        $('.mdl-layout__drawer-right').addClass('active');
     }

  },
  'keyup #delegate-search': function(event, template){
		Session.set('searchPhrase',event.target.value);
	},
  'click .delegate-select': function(event, template){
    var communityId = LocalStore.get('communityId');
    delegateId = this._id;
    var ranks = Session.get('ranked');
    let settings = LocalStore.get('settings');
    let delegateLimit = -1;

    if(typeof settings != 'undefined'){
      if(typeof settings.delegateLimit != 'undefined'){
        delegateLimit = settings.delegateLimit;
      }
    }

    if(delegateLimit==0){
      Bert.alert('Delegate feature disabled', 'danger');
      return false;
    }
    if(delegateLimit==-1){
      addRank(delegateId, (ranks.length +1), communityId);
    }else if(ranks.length>=delegateLimit){
      Bert.alert(TAPi18n.__('pages.delegates.alerts.delegate-limit'), 'danger');
      event.target.checked = false;
    }else{
      addRank(delegateId, (ranks.length +1), communityId);
    }
  },

});
//----------------------------------------------------------------------------------------------//
Template.CommunitySelectedDelegates.onCreated(function () {

});
Template.CommunitySelectedDelegates.onRendered(function () {
    $( "svg" ).delay( 750 ).fadeIn();
    Meteor.defer(function(){
      $( "#sortable" ).sortable();
      $( "#sortable" ).disableSelection();

      $( "#sortable" ).on("sortchange", sortEventHandler);
    });

});
Template.CommunitySelectedDelegates.helpers({
  ranks: function() {
    ranked = Session.get('ranked');
    if(Array.isArray(ranked)){
      if(ranked.length){
        let rankArray = [];
        ranked.forEach(function(rankId) {
          let user = Meteor.users.findOne({"_id":rankId});
          rankArray.push(user);
        });
        return rankArray;//Meteor.users.find( { _id : { $in :  ranked} },{sort: {"ranking":1}});
      }
    }
    return [];
  },
  rankCount: function(){
    ranked = Session.get('ranked');
    if(ranked){
      rankedCount = ranked.length;
      if(rankedCount >= 0){
        return rankedCount;
      }
    }

    /*
    if(Array.isArray(ranked)){
      if(ranked.length){
        return Meteor.users.find( { _id : { $in :  ranked} },{sort: ["ranking"]} ).count();
      }
    }
    */
    return 0;
  },
  getRanking: function(template) {
    communityId = LocalStore.get('communityId');
    result = Ranks.findOne({entityType: 'delegate', entityId: this._id, supporterId: Meteor.userId(),communityId: communityId});
    if(result){
      return result.ranking;
    }
    return null;
  },
  getRank: function(userId) {
    //console.log("getRank userId: " + userId);
    let rank = '';
    let rankMatch = Ranks.findOne({"entityType":"delegate","entityId" : userId,"supporterId" : Meteor.userId()});
    //console.log(rankMatch);
    if(rankMatch){
      if(typeof rankMatch.ranking != 'undefined'){
        rank = rankMatch.ranking + ". ";
      }
    }
    return rank;
  },
  filteredRoles: function(roles){
    return getFilteredRoles(roles);
  },
  showTags: function(tags){
    if(typeof tags != 'undefined'){
      if(Array.isArray(tags)){
        if(tags.length){
          return Tags.find({"_id":{$in:tags}});
        }
      }
    }
    return [];
  },
});
Template.CommunitySelectedDelegates.events({
  'click .delegate-view': function(event, template){
    console.log(".delegate-view selected");
    Session.set('drawerId',this._id);
    if($('.mdl-layout__drawer-right').hasClass('active')){
        $('.mdl-layout__drawer-right').removeClass('active');
     }
     else{
        $('.mdl-layout__drawer-right').addClass('active');
     }

  },
  'click .rank-select': function(event, template){
    delegateId = this._id;
    communityId = LocalStore.get('communityId');
      Meteor.call('removeRank','delegate',delegateId,communityId,function(error,result){
        if (error) {
          RavenClient.captureException(error);
          Bert.alert(error.reason, 'danger');
        } else {
          Session.set('ranked',result);
        }
      });

  },
});
//----------------------------------------------------------------------------------------------//
Template.CommunityDelegateStatus.onCreated(function () {
  var dict = new ReactiveDict();
  this.templateDictionary = dict;
  dict.set("communityId",LocalStore.get('communityId'));
  dict.set('approvalStatus', 'Off');
  userData = Meteor.user();
  //check if user object has approvals property
  for ( var prop in userData ) {
      if(hasOwnProperty(userData,"approvals")){
        ////console.log("userData has approvals");
        approvals = userData.approvals;
        //loop through approvals and check for delegate requests
        approvals.forEach(function (approval, index) {
          if((approval.type=="delegate")&&(approval.communityId==communityId)){
            dict.set('approvalStatus', approval.status);
          }
        });
      }
  }
});
Template.CommunityDelegateStatus.onRendered(function () {

});
Template.CommunityDelegateStatus.helpers({
  delegateChecked: function() {
    var user = Meteor.user();
    var communityId = LocalStore.get('communityId');
    if (user && user.roles){
      var currentRole = LocalStore.get('currentUserRole');
      var userRoles = user.roles;
      var userDelegateCommunities = user.profile.delegateCommunities;
      //console.log("userDelegateCommunities.includes(communityId): " + userDelegateCommunities.includes(communityId));
      if((userRoles.indexOf("delegate") > -1)&&(userDelegateCommunities.includes(communityId))){
        //console.log("user has delegate role in community: " + communityId);
        return true;
      }else{
        approvalStatus = Template.instance().templateDictionary.get('approvalStatus');
        if(approvalStatus=='Requested'){
          return true;
        }
      }
    }
    return false;
    /*
    if(isInRole('delegate')){
      return true;
    }else{
      approvalStatus = Template.instance().templateDictionary.get('approvalStatus');
      if(approvalStatus=='Requested'){
        return true;
      }
      //if approval status set return it, or return "off"
      ////console.log(approvalStatus);
    }
    return false;
    */
  },
  delegateSwitchClass: function(){
    var user = Meteor.user();
    var communityId = LocalStore.get('communityId');
    //check if user object has approvals property
    for ( var prop in user ) {
        if(hasOwnProperty(userData,"approvals")){
          ////console.log("userData has approvals");
          approvals = userData.approvals;
          //loop through approvals and check for delegate requests
          approvals.forEach(function (approval, index) {
            if((approval.type=="delegate")&&(approval.communityId==communityId)){
              if(approval.status=='Requested'){
                return "switch-disabled";
              }
            }
          });
        }
    }
  },
  delegateStatus: function() {
    var status='';
    if(isInRole('delegate')){
      status = TAPi18n.__('generic.approved');
    } else {
      approvalStatus = Template.instance().templateDictionary.get('approvalStatus');
      if(approvalStatus=='Requested'){
        status = TAPi18n.__('generic.requested');
      } else if(approvalStatus=='Rejected'){
        status = TAPi18n.__('generic.rejected');
      }else{
        status = TAPi18n.__('generic.off');
      }
    }
    return status;
  },
});
Template.CommunityDelegateStatus.events({
  'click #profile-delegate-switch' (event, template) {
    //event.preventDefault();
    // Check if person already is a delegate, if so remove role
    if (isInRole('delegate')) {
      if (window.confirm(TAPi18n.__('pages.profile.alerts.profile-stop-delegate'))){
        Meteor.call('toggleRole', 'delegate', false, function(error) {
          if (error) {
            RavenClient.captureException(error);
            Bert.alert(error.reason, 'danger');
          } else {
            Meteor.call('removeRanks', 'delegate', Meteor.userId());
            var msg = TAPi18n.__('pages.profile.alerts.profile-delegate-removed');
            Bert.alert(msg, 'success');
          }
        });
      }
    } else {
      //check if request has already been submitted
      approvalStatus = Template.instance().templateDictionary.get('approvalStatus');
      if(approvalStatus=='Requested'){
        Meteor.call('removeRequest', Meteor.userId(), 'delegate', function(error) {
          if (error) {
            RavenClient.captureException(error);
            Bert.alert(error.reason, 'danger');
            updateDisplayedStatus('delegate', template)
          } else {
            var msg = TAPi18n.__('pages.profile.alerts.profile-delegate-request-removed');
            //$("#profile-delegate-switch").addClass("switch-disabled");
            template.templateDictionary.set('approvalStatus','');
            Bert.alert(msg, 'success');

          }
        });
        return;
      }
      var communityId = LocalStore.get('communityId');
      // Profile is complete, submit approval request
      Meteor.call('requestApproval', Meteor.userId(), 'delegate', communityId,function(error) {
        if (error) {
          RavenClient.captureException(error);
          Bert.alert(error.reason, 'danger');
          updateDisplayedStatus('delegate', template);
          document.getElementById("profile-delegate-switch").checked = false;
        } else {
          var msg = TAPi18n.__('pages.profile.alerts.profile-delegate-requested');
          $("#profile-delegate-switch").addClass("switch-disabled");
          template.templateDictionary.set('approvalStatus','Requested');
          Bert.alert(msg, 'success');
        }
      });
    }
  },
});
//----------------------------------------------------------------------------------------------//
function getFilteredRoles(roles){
  if(roles){
    let index = roles.indexOf('delegate')
    if (index !== -1) {
      roles.splice(index, 1);
    }
    index = roles.indexOf('admin')
    if (index !== -1) {
      roles.splice(index, 1);
    }
    index = roles.indexOf('superadmin')
    if (index !== -1) {
      roles.splice(index, 1);
    }
    index = roles.indexOf('demo')
    if (index !== -1) {
      roles.splice(index, 1);
    }
    index = roles.indexOf('candidate')
    if (index !== -1) {
      roles.splice(index, 1);
    }
    if(Array.isArray(roles)){
      return roles;
    }else{
      return [];
    }
  }
}


Template.Delegate.onCreated(function () {
  var communityId = LocalStore.get('communityId');
  Session.set('searchPhrase','');
  var dict = new ReactiveDict();
  this.templateDictionary = dict;
  dict.set("communityId",LocalStore.get('communityId'));
  dict.set('approvalStatus', 'Off');
  userData = Meteor.user();
  //check if user object has approvals property
  for ( var prop in userData ) {
      if(hasOwnProperty(userData,"approvals")){
        ////console.log("userData has approvals");
        approvals = userData.approvals;
        //loop through approvals and check for delegate requests
        approvals.forEach(function (approval, index) {
          if((approval.type=="delegate")&&(approval.communityId==communityId)){
            dict.set('approvalStatus', approval.status);
          }
        });
      }
  }
  var self = this;
  self.ranks = new ReactiveVar([]);

  self.autorun(function() {
    self.subscribe("simpleSearch",Session.get('searchPhrase'),"delegate", communityId);
    self.subscribe('ranks.currentUser', communityId);
    self.subscribe('tags.community', LocalStore.get('communityId'));
    // Set user's ranked delegates
    if(Meteor.userId()){
      //console.log("calling getRanks, should happen every time a community is updated");
      Meteor.call('getRanks', Meteor.userId(), "delegate", LocalStore.get('communityId'), function(error, result){
        if(error) {
          RavenClient.captureException(error);
          Bert.alert(error.reason, 'danger');
        } else {
          Session.set('ranked', result);
          //dict.set('ranked',result);
        }
      });
    }

  });

});

Template.Delegate.onRendered(function () {
  $( "svg" ).delay( 750 ).fadeIn();
  Meteor.defer(function(){
    $( "#sortable" ).sortable();
    $( "#sortable" ).disableSelection();

    $( "#sortable" ).on("sortchange", sortEventHandler);
  });

});

Template.Delegate.helpers({
  rankCount: function(){
    ranked = Session.get('ranked');
    if(ranked){
      rankedCount = ranked.length;
      if(rankedCount >= 0){
        return rankedCount;
      }
    }

    /*
    if(Array.isArray(ranked)){
      if(ranked.length){
        return Meteor.users.find( { _id : { $in :  ranked} },{sort: ["ranking"]} ).count();
      }
    }
    */
    return 0;
  },
  notDelegate: function() {
    if(Roles.userIsInRole(Meteor.user(), ['delegate'])){
      return false;
    }
    return true;
  },
  getRanking: function(template) {
    communityId = Template.instance().templateDictionary.get( 'communityId' );
    result = Ranks.findOne({entityType: 'delegate', entityId: this._id, supporterId: Meteor.userId(),communityId: communityId});
    if(result){
      return result.ranking;
    }
    return null;
  },
  getRank: function(userId) {
    let rank = -1;
    let rankMatch = Ranks.findOne({"entityType":"delegate","entityId" : userId,"supporterId" : Meteor.userId()});
    if(rankMatch){
      if(typeof rankMatch.ranking != 'undefined'){
        rank = rankMatch.ranking;
      }
    }
    return rank + ". ";
  },
  ranks: function() {
    ranked = Session.get('ranked');
    if(Array.isArray(ranked)){
      if(ranked.length){
        let rankArray = [];
        ranked.forEach(function(rankId) {
          let user = Meteor.users.findOne({"_id":rankId});
          rankArray.push(user);
        });
        return rankArray;//Meteor.users.find( { _id : { $in :  ranked} },{sort: {"ranking":1}});
      }
    }
    return [];
  },
  delegates: function() {
    /* DO NOT SHOW CURRENT USER IN DELEGATE SEARCH
    delegates = Meteor.users.find( { $and: [
      { _id : { $nin : Session.get('ranked')}},
      { _id : { $ne: Meteor.userId()} }
    ]});
    */
    let delegates = [];
    let ranked = Session.get('ranked');
    var communityId = LocalStore.get('communityId');
    if(Array.isArray(ranked)){
      delegates = Meteor.users.find( { $and: [
        { _id : { $nin : ranked}},
        {"roles":"delegate","profile.delegateCommunities":communityId}
      ]})
    }else{

      delegates = Meteor.users.find({"roles":"delegate","profile.delegateCommunities":communityId});
    }
    /*
    delegates = Meteor.users.find( { $and: [
      { _id : { $nin : Session.get('ranked')}}
    ]});
    */
    return delegates;
  },
  delegatesCount: function() {
    /* DO NOT SHOW CURRENT USER IN DELEGATE SEARCH
    delegates = Meteor.users.find( { $and: [
      { _id : { $nin : Session.get('ranked')}},
      { _id : { $ne: Meteor.userId()} }
    ]});
    */
    let ranked = Session.get('ranked');
    let delegatesCount = 0;
    var communityId = LocalStore.get('communityId');
    if(Array.isArray(ranked)){
      delegatesCount = Meteor.users.find( { $and: [
        { _id : { $nin : ranked}},
        {"roles":"delegate","profile.delegateCommunities":communityId}
      ]}).count()
    }else{
      delegatesCount = Meteor.users.find({"roles":"delegate","profile.delegateCommunities":communityId}).count();
    }
    return delegatesCount;
  },
  searchPhrase: function() {
  	return Session.get('searchPhrase');
  },
  delegatesEnabled: function(){
    let settings = LocalStore.get('settings');
    let delegateLimit = -1;

    if(typeof settings != 'undefined'){
      if(typeof settings.delegateLimit != 'undefined'){
        delegateLimit = settings.delegateLimit;
      }else{
        console.log("settings.delegateLimit undefined");
      }
    }else{
      console.log("settings undefined");
    }
    if(delegateLimit==0){
      return false;
    }
    return true;
  },
  filteredRoles: function(roles){
    if(roles){
      let index = roles.indexOf('delegate')
      if (index !== -1) {
        roles.splice(index, 1);
      }
      index = roles.indexOf('admin')
      if (index !== -1) {
        roles.splice(index, 1);
      }
      index = roles.indexOf('superadmin')
      if (index !== -1) {
        roles.splice(index, 1);
      }
      index = roles.indexOf('demo')
      if (index !== -1) {
        roles.splice(index, 1);
      }
      index = roles.indexOf('candidate')
      if (index !== -1) {
        roles.splice(index, 1);
      }
      if(Array.isArray(roles)){
        return roles;
      }else{
        return [];
      }
    }
  },
  showTags: function(tags){
    if(typeof tags != 'undefined'){
      if(Array.isArray(tags)){
        if(tags.length){
          return Tags.find({"_id":{$in:tags}});
        }
      }
    }
    return [];
  },
  delegateChecked: function() {
    var user = Meteor.user();
    var communityId = LocalStore.get('communityId');
    if (user && user.roles){
      var currentRole = LocalStore.get('currentUserRole');
      var userRoles = user.roles;
      var userDelegateCommunities = user.profile.delegateCommunities;
      //console.log("userDelegateCommunities.includes(communityId): " + userDelegateCommunities.includes(communityId));
      if((userRoles.indexOf("delegate") > -1)&&(userDelegateCommunities.includes(communityId))){
        console.log("user has delegate role in community: " + communityId);
        return true;
      }else{
        approvalStatus = Template.instance().templateDictionary.get('approvalStatus');
        if(approvalStatus=='Requested'){
          return true;
        }
      }
    }
    return false;
    /*
    if(isInRole('delegate')){
      return true;
    }else{
      approvalStatus = Template.instance().templateDictionary.get('approvalStatus');
      if(approvalStatus=='Requested'){
        return true;
      }
      //if approval status set return it, or return "off"
      ////console.log(approvalStatus);
    }
    return false;
    */
  },
  delegateSwitchClass: function(){
    var user = Meteor.user();
    var communityId = LocalStore.get('communityId');
    //check if user object has approvals property
    for ( var prop in user ) {
        if(hasOwnProperty(userData,"approvals")){
          ////console.log("userData has approvals");
          approvals = userData.approvals;
          //loop through approvals and check for delegate requests
          approvals.forEach(function (approval, index) {
            if((approval.type=="delegate")&&(approval.communityId==communityId)){
              if(approval.status=='Requested'){
                return "switch-disabled";
              }
            }
          });
        }
    }
  },
  delegateStatus: function() {
    var status='';
    if(isInRole('delegate')){
      status = TAPi18n.__('generic.approved');
    } else {
      approvalStatus = Template.instance().templateDictionary.get('approvalStatus');
      if(approvalStatus=='Requested'){
        status = TAPi18n.__('generic.requested');
      } else if(approvalStatus=='Rejected'){
        status = TAPi18n.__('generic.rejected');
      }else{
        status = TAPi18n.__('generic.off');
      }
    }
    return status;
  },
});

Template.Delegate.events({
	'keyup #delegate-search': function(event, template){
		Session.set('searchPhrase',event.target.value);
	},
  'click #profile-delegate-switch' (event, template) {
    //event.preventDefault();
    // Check if person already is a delegate, if so remove role
    if (isInRole('delegate')) {
      if (window.confirm(TAPi18n.__('pages.profile.alerts.profile-stop-delegate'))){
        Meteor.call('toggleRole', 'delegate', false, function(error) {
          if (error) {
            RavenClient.captureException(error);
            Bert.alert(error.reason, 'danger');
          } else {
            Meteor.call('removeRanks', 'delegate', Meteor.userId());
            var msg = TAPi18n.__('pages.profile.alerts.profile-delegate-removed');
            Bert.alert(msg, 'success');
          }
        });
      }
    } else {
      //check if request has already been submitted
      approvalStatus = Template.instance().templateDictionary.get('approvalStatus');
      if(approvalStatus=='Requested'){
        Meteor.call('removeRequest', Meteor.userId(), 'delegate', function(error) {
          if (error) {
            RavenClient.captureException(error);
            Bert.alert(error.reason, 'danger');
            updateDisplayedStatus('delegate', template)
          } else {
            var msg = TAPi18n.__('pages.profile.alerts.profile-delegate-request-removed');
            //$("#profile-delegate-switch").addClass("switch-disabled");
            template.templateDictionary.set('approvalStatus','');
            Bert.alert(msg, 'success');

          }
        });
        return;
      }
      var communityId = LocalStore.get('communityId');
      // Profile is complete, submit approval request
      Meteor.call('requestApproval', Meteor.userId(), 'delegate', communityId,function(error) {
        if (error) {
          RavenClient.captureException(error);
          Bert.alert(error.reason, 'danger');
          updateDisplayedStatus('delegate', template);
          document.getElementById("profile-delegate-switch").checked = false;
        } else {
          var msg = TAPi18n.__('pages.profile.alerts.profile-delegate-requested');
          $("#profile-delegate-switch").addClass("switch-disabled");
          template.templateDictionary.set('approvalStatus','Requested');
          Bert.alert(msg, 'success');
        }
      });
    }
  },
  'click .delegate-select': function(event, template){
    var communityId = Template.instance().templateDictionary.get( 'communityId' );
    delegateId = this._id;
    var ranks = Session.get('ranked');
    let settings = LocalStore.get('settings');
    let delegateLimit = -1;

    if(typeof settings != 'undefined'){
      if(typeof settings.delegateLimit != 'undefined'){
        delegateLimit = settings.delegateLimit;
      }
    }

    if(delegateLimit==0){
      Bert.alert('Delegate feature disabled', 'danger');
      return false;
    }
    if(delegateLimit==-1){
      addRank(delegateId, (ranks.length +1), communityId);
    }else if(ranks.length>=delegateLimit){
      Bert.alert(TAPi18n.__('pages.delegates.alerts.delegate-limit'), 'danger');
      event.target.checked = false;
    }else{
      addRank(delegateId, (ranks.length +1), communityId);
    }
  },
  'click .rank-select': function(event, template){
    delegateId = this._id;
    communityId = Template.instance().templateDictionary.get( 'communityId' )
      Meteor.call('removeRank','delegate',delegateId,communityId,function(error,result){
        if (error) {
          RavenClient.captureException(error);
          Bert.alert(error.reason, 'danger');
        } else {
          Session.set('ranked',result);
        }
      });

  },
  'click .delegate-view': function(event, template){
    Session.set('drawerId',this._id);
    if($('.mdl-layout__drawer-right').hasClass('active')){
        $('.mdl-layout__drawer-right').removeClass('active');
     }
     else{
        $('.mdl-layout__drawer-right').addClass('active');
     }

  },
  'click #delegate-help'(event, template){
    var steps = [
      {
        element: '.search-wrapper',
        intro: "Search for delegates here.",
        position: 'top'
      },
      {
        element: '.delegate-item',
        intro: "Select preferred delegates from the list.",
        position: 'top'
      },
      {
        element: '.mdl-checkbox',
        intro: "Click the checkbox to select a delegate. You can choose a maximum of five.",
        position: 'top'
      },

    ];
    walkThrough(steps);
  }
});

function sortEventHandler(){
  $('#sortable').sortable({
    update: function(event, ui) {
      var order = $(this).sortable('toArray');
      Meteor.call('updateRanks',order,'delegate', function(error,result){
        if(error){
          RavenClient.captureException(error);
          Bert.alert(error.reason, 'danger');
        }else{
          Bert.alert(TAPi18n.__('pages.delegates.alerts.ranking-updated'), 'success');
        }
      });
    }
  });
}

function addRank(delegateId, newRank, communityId){
  Meteor.call('addRank','delegate',delegateId,newRank,communityId,function(error,result){
    if (error) {
      RavenClient.captureException(error);
      Bert.alert(error.reason, 'danger');
    } else {
      Session.set('ranked',result);
    }
  });
}

function isInRole(role){
  var user = Meteor.user();
  var communityId = LocalStore.get('communityId');
  if (user && user.roles){
    var currentRole = LocalStore.get('currentUserRole');
    var userRoles = user.roles;
    var userDelegateCommunities = user.profile.delegateCommunities;
    //console.log("userDelegateCommunities.includes(communityId): " + userDelegateCommunities.includes(communityId));
    if((userRoles.indexOf(role) > -1)&&(userDelegateCommunities.includes(communityId))){
      return Roles.userIsInRole(Meteor.user(), role);
    }
  }
  return false;
}

function hasOwnProperty(obj, prop) {
  var proto = obj.__proto__ || obj.constructor.prototype;
  return (prop in obj) &&
    (!(prop in proto) || proto[prop] !== obj[prop]);
}
