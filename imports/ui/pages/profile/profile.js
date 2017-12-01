import "./profileForm.js"
import "./profile.html"

Template.Profile.onCreated(function() {
  var self = this;
  self.delegateStatus = new ReactiveVar('');
  self.candidateStatus = new ReactiveVar('');

  const handle = Meteor.subscribe('users.current');

  Tracker.autorun(() => {
    const isReady = handle.ready();
    
    if (isReady){
      // Set public/private switch
      updatePublicSwitch(self);
      // Set approval statuses and switches
      self.delegateStatus.set(updateDisplayedStatus('delegate', self));
      self.candidateStatus.set(updateDisplayedStatus('candidate', self));
    }
  });

  var dict = new ReactiveDict();
  
  Meteor.call('getProfile',Meteor.userId(),function(error,result){
    if (error){
      Bert.alert(error.reason, 'danger');
    }else{
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
    if (event.target.checked && !Session.get('profileIsComplete')){
      Bert.alert('You can not have a public profile if it is incomplete.', 'danger');
      template.find('#profile-public-switch-label').MaterialSwitch.off();
    } else {

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

    }
  },  
  'click #profile-delegate-switch' (event, template) {
    //Step 1: Check if person already is a delegate, if so remove role
    if (isInRole('delegate')) {
      if (window.confirm('Are you sure you want to stop being a delegate?')){
        Meteor.call('toggleRole', Meteor.userId(), 'delegate', false, function(error) {
          if (error) {
            Bert.alert(error.reason, 'danger');
          } else {
            var msg = TAPi18n.__('profile-msg-delegate-removed');
            Bert.alert(msg, 'success');
          }
        });
      }
    } else {
      //Step 2: If person not delegate, check profile is complete before submission
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
      if (window.confirm('Are you sure you want to stop being a candidate?')){
        Meteor.call('toggleRole', Meteor.userId(), 'candidate', false, function(error) {
          if (error) {
            Bert.alert(error.reason, 'danger');
          } else {
            var msg = TAPi18n.__('profile-msg-candidate-removed');
            Bert.alert(msg, 'success');
          }
        });
      } 
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
    var status;
    if(isInRole('delegate')){
      status = "Approved";
    } else {
      status = Template.instance().delegateStatus.get()
      if (status == 'Approved'){
        /*if the status is approved, but the user is not in the role, then
        they were previously approved, but revoked the role themselves*/ 
        status = '';
      }
    }
    return status;
  },
  candidateStatus: function() {
    var status;
    if(isInRole('candidate')){
      status = "Approved";
    } else {
      status = Template.instance().candidateStatus.get()
      if (status == 'Approved'){
        /*if the status is approved, but the user is not in the role, then
        they were previously approved, but revoked the role themselves*/ 
        status = '';
      }
    }
    return status;
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
});

function isInRole(role){
  return Roles.userIsInRole(Meteor.user(), role);
}

function updateDisplayedStatus(type, template){
  var approvals = Meteor.user().approvals
    var currentApproval = approvals.find(approval => approval.type === type)
    if (currentApproval){
      var status = currentApproval.status
      var statusSwitch = template.find('#profile-' + type + '-switch-label').MaterialSwitch;
      if (statusSwitch) {
        if(status=='Requested'){
          statusSwitch.disable();
        } else {
          statusSwitch.enable();
        }
        if(isInRole(type)){
          statusSwitch.on();
        } else {
          statusSwitch.off();
        }
      } 
      return status;
    }
}

function updatePublicSwitch(template){
  var publicSwitch = template.find('#profile-public-switch-label').MaterialSwitch
      if (isInRole('candidate') || isInRole('delegate')){
        publicSwitch.disable();
      } else {
        publicSwitch.enable();
      }
      if( Meteor.user().isPublic) {
        publicSwitch.on();
      } else {
        publicSwitch.off();
      }
}