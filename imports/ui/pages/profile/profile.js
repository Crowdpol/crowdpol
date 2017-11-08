import "./profileForm.js"
import "./profile.html"

Template.Profile.onCreated(function() {
  var self = this;
  self.autorun(function() {
    self.subscribe('user.current');
  });
  self.delegateStatus = new ReactiveVar("Waiting for response from server...");
  self.candidateStatus = new ReactiveVar("Waiting for response from server...");
  Meteor.call('getDelegateStatus',Meteor.userId(),function(error,result) {
      if (error) {
        console.log(error);
      } else {
        self.delegateStatus.set(result);
      }
  });
  Meteor.call('getCandidateStatus',Meteor.userId(),function(error,result) {
      if (error) {
        console.log(error);
      } else {
        self.candidateStatus.set(result);
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
    if (isRole('delegate')) {
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
    if (isRole('candidate')) {
      Meteor.call('toggleRole', Meteor.userId(), 'candidate', false, function(error) {
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          var msg = "You are no longer a candidate";
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
          var msg = "Request submitted"; //TAPi18n.__('profile-msg-private');
          Bert.alert(msg, 'success');
        }
      });
    }
  }
});

Template.Profile.helpers({
  /* NOTE: Consider deleting if not being used
  user: function() {
    user = Meteor.users.findOne({ _id: Meteor.userId() }, { fields: { profile: 1, roles: 1, isPublic: 1, isParty: 1, isOrganisation: 1 } });
    //console.log(user);
    return user;
  },*/
  delegateStatus: function() {
    return Template.instance().delegateStatus.get();
  },
  candidateStatus: function() {
    return Template.instance().candidateStatus.get();
  },
  isPublic: function() {
    return Meteor.user().isPublic;
  },
  isOrganisation: function() {
    return Meteor.user().isOrganisation;
  },
  isParty: function() {
    return Meteor.user().isParty;
  },
  isOrganisationRole: function() {
    return isRole('organisation-delegate');
  },
  isPartyRole: function() {
    return isRole('party-delegate');
  },
  userIsDelegate: function(){
    return isRole('delegate');
  },
  userIsCandidate: function(){
    return isRole('candidate');
  },
  publicChecked: function(){
    if(Meteor.user().isPublic){
      return 'checked';
    }
  },
  delegateChecked: function(){
    if(isRole('delegate')){
      return 'checked';
    }
  },
  candidateChecked: function(){
    if(isRole('candidate')){
      return 'checked';
    }
  },
});

//check criteria for public status
function publicReady(){
  return true;
}

function isRole(role){
  return Roles.userIsInRole(Meteor.user(), role);
  //console.log(role + " isRole: " + isRole);
}