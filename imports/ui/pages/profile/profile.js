import "./profileForm.js"
import "./profile.html"

Template.Profile.onCreated(function() {
  var self = this;
  self.delegateStatus = new ReactiveVar("Waiting for response from server...");
  self.candidateStatus = new ReactiveVar("Waiting for response from server...");
  self.autorun(function() {
    self.subscribe('users.current');
  });

  var dict = new ReactiveDict();
  
  Meteor.call('getProfile',Meteor.userId(),function(error,result){
    if (error){
      Bert.alert(error.reason, 'danger');
    }else{
      console.log('here comes the profile sonnny:')
      console.log(result)
      dict.set( 'isPublic', result.isPublic );
      dict.set( 'username', result.profile.username );
      dict.set( 'firstname', result.profile.firstName );
      dict.set( 'lastname', result.profile.lastName );
      dict.set( 'isPublic', result.isPublic );
      if(result.profile.hasOwnProperty("photo")){
        dict.set('photo', result.profile.photo );
      }else{
        dict.set('photo', "/img/default-user-image.png");
      }
    }
  });
});

Template.Profile.events({
  'click #profile-public-switch' (event, template) {
    Meteor.call('togglePublic', Meteor.userId(), event.target.checked, function(error) {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        var msg = TAPi18n.__('profile-msg-private');
        if (event.target.checked) {
          msg = TAPi18n.__('profile-msg-public');
        }
        Bert.alert(msg, 'success');
      }
    });
  },  
  'click #profile-delegate-switch' (event, template) {
    //Step 1: Check if person already is a delegate, if so remove role
    if (isInRole('delegate')) {
      Meteor.call('toggleRole', Meteor.userId(), 'delegate', false, function(error) {
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          var msg = TAPi18n.__('profile-msg-delegate-removed');
          Bert.alert(msg, 'success');
        }
      });
    } else {
      //Step 2: If person not delegate, check profile is complete before submission
      //NOTE: inomplete
      //Step 3: Profile is complete, submit approval request
      Meteor.call('requestApproval', Meteor.userId(), 'delegate', function(error) {
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          var msg = TAPi18n.__('profile-msg-delegate-requested');
          Bert.alert(msg, 'success');
        }
      });
    }
  },
  'click #profile-candidate-switch' (event, template) {
    //Step 1: Check if person already is a candidate, if so remove role
    if (isInRole('candidate')) {
      Meteor.call('toggleRole', Meteor.userId(), 'candidate', false, function(error) {
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          var msg = TAPi18n.__('profile-msg-candidate-removed');
          Bert.alert(msg, 'success');
        }
      });
    } else {
      //Step 2: If person not candidate, check profile is complete before submission
      //NOTE: inomplete
      //Step 3: Profile is complete, submit approval request
      Meteor.call('requestApproval', Meteor.userId(), 'candidate', function(error) {
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          var msg = TAPi18n.__('profile-msg-delegate-requested');
          Bert.alert(msg, 'success');
        }
      });
    }
  }
});

Template.Profile.helpers({
  delegateStatus: function() {
    if(isInRole('delegate')){
      return "Approved";
    }
    return approvalStatus('delegate')
     
  },
  candidateStatus: function() {
    if(isInRole('candidate')){
      return "Approved";
    }

    return approvalStatus('candidate')
  },
  isPublic: function() {
    return Meteor.user().isPublic;
  },
  isOrganisation: function() {
    return isInRole('organisation');
  },
  isParty: function() {
    return isInRole('party');
  },
  isDelegate: function(){
    return isInRole('delegate');
  },
  isCandidate: function(){
    return isInRole('candidate');
  },
  publicDisabled: function(){
    if(!publicReady()){
      return 'disabled';
    }
  },
  publicChecked: function(){
    if(Meteor.user().isPublic){
      return 'checked';
    }
  },
  delegateDisabled: function(){
    var status = approvalStatus('delegate');
    if(status=='Requested'){
      console.log("delegate should be disabled");
      return 'disabled';
    }
  },
  delegateChecked: function(){
    if(isInRole('delegate')){
      return 'checked';
    }
  },
  candidateDisabled: function(){
    var status = approvalStatus('candidate');
    if(status=='Requested'){
      console.log("candidate should be disabled");
      return 'disabled';
    }
  },
  candidateChecked: function(){
    if(isInRole('candidate')){
      return 'checked';
    }
  },
});

function isInRole(role){
  return Roles.userIsInRole(Meteor.user(), role);
}

function approvalStatus(type){
  var approvals = Meteor.user().approvals
    var currentApproval = approvals.find(approval => approval.type === type)
    if (currentApproval){
      return currentApproval.status;
    }
}