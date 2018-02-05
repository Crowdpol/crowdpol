import "./profileForm.html"
import { setupTaggle } from '../../components/taggle/taggle.js'

Template.ProfileForm.onRendered(function(){
  var self = this;
  self.delegateStatus = new ReactiveVar('');
  self.candidateStatus = new ReactiveVar('');

  self.taggle = new ReactiveVar(setupTaggle());

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

  Session.set('profileIsComplete', checkProfileIsComplete())

  Meteor.call('getUserTags', Meteor.userId(), function(error, result){
    if (error){
      Bert.alert(error.reason, 'danger');
    } else {
      var keywords = _.map(result, function(tag){ return tag.keyword; });
      self.taggle.get().add(keywords);
    }
  });
});

Template.ProfileForm.onCreated(function() {
  var self = this;
  self.type = new ReactiveVar("Waiting for response from server...");
  
  self.autorun(function() {
    self.subscribe('user.current');
  });
  var dict = new ReactiveDict();

  Meteor.call('getProfile', Meteor.userId(), function(error, result) {
    if (error) {
      Bert.alert(error.reason, 'danger');
    } else {
      dict.set('isPublic', result.isPublic);
      dict.set('username', result.profile.username);
      dict.set('firstname', result.profile.firstName);
      dict.set('lastname', result.profile.lastName);
      dict.set('bio', result.profile.bio);
      dict.set('website', result.profile.website);
      dict.set('isPublic', result.isPublic);
      dict.set('type', result.profile.type);
      dict.set('credentials', result.profile.credentials);
      dict.set('showPublic', result.isPublic);
      self.type.set(result.profile.type);
      if (result.profile.hasOwnProperty("photo")) {
        dict.set('photo', result.profile.photo);
      } else {
        dict.set('photo', "/img/default-user-image.png");
      }
    }
  });
  this.templateDictionary = dict;
});

Template.ProfileForm.events({
  'keyup input, keyup textarea' (event, template){
    Session.set('profileIsComplete', checkProfileIsComplete())
  },

  
  'click #profile-public-switch' (event, template) {
    event.preventDefault();
    //var shown = Template.instance().templateDictionary.get('showPublic');
    //Template.instance().templateDictionary.set('showPublic',!shown);
    
    //Check if user is public
    if( Meteor.user().isPublic) {
      //True: - go private
        //1 Check if user is delegate
        if (isInRole('delegate')) {
          //true - let user know they cannot go private while delegate
            Bert.alert("Remove delegate role before going private", 'danger');
        }else{
          //false - make user private
          togglePublic(false);
        }
    }else{
      //False - check if form is complete
      if(Session.get('profileIsComplete')){
        //enable delegate button
        togglePublic(true);
      }else{
        //profile incomplete message
        msg = "Profile is incomplete";
        Bert.alert(msg, 'danger');
      }

    }

  },
  'click #profile-delegate-switch' (event, template) {
    // Check if person already is a delegate, if so remove role
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
      // Profile is complete, submit approval request
      Meteor.call('requestApproval', Meteor.userId(), 'delegate', function(error) {
        if (error) {
          Bert.alert(error.reason, 'danger');
          updateDisplayedStatus('delegate', template)
        } else {
          var msg = TAPi18n.__('pages.profile.alerts.profile-delegate-requested');
          Bert.alert(msg, 'success');
        }
      });
    }
  },
  'click #profile-candidate-switch' (event, template) {
    // Check if person already is a candidate, if so remove role
    if (isInRole('candidate')) {
      Meteor.call('toggleRole', Meteor.userId(), 'candidate', false, function(error) {
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          var msg = TAPi18n.__('pages.profile.alerts.profile-candidate-removed');
          Bert.alert(msg, 'success');
        }
      });
    } else {
      // Profile is complete, submit approval request
      Meteor.call('requestApproval', Meteor.userId(), 'candidate', function(error) {
        if (error) {
          Bert.alert(error.reason, 'danger');
          updateDisplayedStatus('candidate', template)
        } else {
          var msg = TAPi18n.__('pages.profile.alerts.profile-candidate-requested');
          Bert.alert(msg, 'success');
        }
      });
    }
  },
  'submit form' (event, template) {
    console.log("submit clicked");
    event.preventDefault();
  },
  
});

Template.ProfileForm.onRendered(function() {
  let template = Template.instance();

  $("#profile-form").validate({
    rules: {
      profileUsername: {
        required: true,
        minlength: 5,
        maxlength: 16,
        
      },
      profileWebsite: {
        url: true
      },
    },
    messages: {
      profileUsername: {
        required: "Username required.",
        minlength: "Minimum of 5 characters",
        maxlength: "Maximum of 16 characters",
      },
    },
    submitHandler() {
      Meteor.call('transformTags', template.taggle.get().getTagValues(), function(error, proposalTags){
        if (error){
          Bert.alert(error, 'reason');
        } else {
          var profile = {
            username: Template.instance().templateDictionary.get('username'),//template.find('[name="profileUsername"]').value,
            firstName: template.find('[name="profileFirstName"]').value,
            lastName: template.find('[name="profileLastName"]').value,
            photo: Template.instance().templateDictionary.get('photo'),//template.find('[name="profilePhotoPath"]').value,
            bio: template.find('[name="profileBio"]').value,
            website: template.find('[name="profileWebsite"]').value,
            credentials: template.templateDictionary.get('credentials'),
            type: template.type.get(),
            tags: proposalTags
          };

          Meteor.call('updateProfile', Meteor.userId(), profile, function(error) {
            if (error) {
              Bert.alert(error.reason, 'danger');
            } else {
              //template.find('#profile-form').reset();
              Bert.alert(TAPi18n.__('pages.profile.alerts.profile-updated'), 'success');
            }
          });

        } 
      });
      
    }
  });
});

Template.ProfileForm.helpers({
  isEntity: function() {
    var type = Template.instance().type.get();
    console.log(type);
    if (type == 'Entity') {
      console.log("should be hidden");
      return true;
    }
    console.log("show lastname");
    return false;
  },
  profile: function() {
    user = Meteor.users.findOne({ _id: Meteor.userId() }, { fields: { profile: 1, roles: 1, isPublic: 1, isParty: 1, isOrganisation: 1 } });
    console.log(user);
    return user.profile;
  },
  profilePic: function() {
    return Template.instance().templateDictionary.get('photo');
  },
  firstName: function() {
    return Template.instance().templateDictionary.get('firstname');
  },
  lastName: function() {
    return Template.instance().templateDictionary.get('lastname');
  },
  username: function() {
    return Template.instance().templateDictionary.get('username');
  },
  bio: function() {
    return Template.instance().templateDictionary.get('bio');
  },
  website: function() {
    return Template.instance().templateDictionary.get('website');
  },
  type: function() {
    //return Template.instance().templateDictionary.get('type');
    return Template.instance().type.get();
  },
  isPublicChecked: function() {
    var isPublic = Template.instance().templateDictionary.get('isPublic');
    console.log("isPublicChecked: " + isPublic);
    if (isPublic) {
      return "checked";
    }
  },
  saveDisabled: function(){
    if (Meteor.user().isPublic && !Session.get('profileIsComplete')){
      return 'disabled';
    } else {
      return '';
    }
  },
  isPublic: function() {
    return Meteor.user().isPublic;
  },
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
});

function hasOwnProperty(obj, prop) {
  var proto = obj.__proto__ || obj.constructor.prototype;
  return (prop in obj) &&
    (!(prop in proto) || proto[prop] !== obj[prop]);
}

function checkProfileIsComplete(){
  var template = Template.instance();
  var profile = {
    firstName: template.find('[name="profileFirstName"]').value,
    lastName: template.find('[name="profileLastName"]').value,
    bio: template.find('[name="profileBio"]').value,
    website: template.find('[name="profileWebsite"]').value,
    tags: template.taggle.get().getTagValues()
  };
  //photo: template.find('[name="profilePhotoPath"]').value,
  //username: template.find('[name="profileUsername"]').value,
  var isComplete = true;
  var profileFields = _.keys(profile);
  public = profile;
  if (profile.tags.length < 5){
    isComplete = false;
  } else {
    _.map(profileFields, function(field){
      if (profile[field].length == 0){
        isComplete = false;
      } 
    });
  }
  return isComplete;
}

function isInRole(role){
  return Roles.userIsInRole(Meteor.user(), role);
}

function updateDisplayedStatus(type, template){
  var approvals = Meteor.user().approvals
  if (approvals) {
    var currentApproval = approvals.find(approval => approval.type === type)
    if (currentApproval){
      var status = currentApproval.status
      var statusSwitch = template.find('#profile-' + type + '-switch-label').MaterialSwitch;
      if (statusSwitch) {
        if(status=='Requested'){
          statusSwitch.disable();
          statusSwitch.on();
        } else {
          statusSwitch.enable();
          if(isInRole(type)){
            statusSwitch.on();
          } else {
            statusSwitch.off();
          }
        }
      } 
      return status;
    }
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

function togglePublic(isPublic){
  Meteor.call('togglePublic', Meteor.userId(), isPublic, function(error) {
            if (error) {
              Bert.alert(error.reason, 'danger');
            } else {
              var msg = TAPi18n.__('pages.profile.alerts.profile-private');
              if (event.target.checked) {
                msg = TAPi18n.__('pages.profile.alerts.profile-public');
              }
              Bert.alert(msg, 'success');
            }
          });
}