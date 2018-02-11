import "./profileForm.html"
import { setupTaggle } from '../../components/taggle/taggle.js'

Template.ProfileForm.onRendered(function(){
  var self = this;
  self.delegateStatus = new ReactiveVar(false);
  self.candidateStatus = new ReactiveVar(false);

  self.taggle = new ReactiveVar(setupTaggle());

  const handle = Meteor.subscribe('users.current');

  Tracker.autorun(() => {
    const isReady = handle.ready();
    
    if (isReady){
      // Set public/private switch
      updatePublicSwitch(self);
      // Set approval statuses and switches
      self.delegateStatus.set(updateDisplayedStatus('delegate', self));
      //self.candidateStatus.set(updateDisplayedStatus('candidate', self));
    }
  });

  Session.set('profileIsComplete', checkProfileIsComplete(self))
  Session.set('showCompleteStatus', false);
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
  dict.set('completedScore', 0);
  dict.set('photoCompleted', true);
  dict.set('usernameCompleted', true);
  dict.set('firstnameCompleted', true);
  dict.set('lastnameCompleted', false);
  dict.set('urlCompleted', false);
  dict.set('bioCompleted', false);
  dict.set('bioCount', 0);
  dict.set('tagsCompleted', false);
  dict.set('tagsCount', 0);

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
      dict.set('profileType', result.profile.type);
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
    Session.set('profileIsComplete', checkProfileIsComplete(template))
  },
  'click #show-settings' (event, template) {
    event.preventDefault();
    if(Session.get('showSettings')){
      $( "#public-form-details" ).hide();
    }else{
      $( "#public-form-details" ).show();
    }
    Session.set('showSettings',!Session.get('showSettings'))
  },
  'blur #profile-website' (event, template) {
        if (validateUrl(event.currentTarget.value)) {
          //$('#submitProfile').removeAttr('disabled', 'disabled');
          //$('form').unbind('submit');
          template.templateDictionary.set('usernameCompleted',true);
          $("#valid-url").html('<i class="material-icons">check</i>');

        } else {
          $("#valid-url").text("");
          template.templateDictionary.set('usernameCompleted',false);
          //$('#submitProfile').attr('disabled', 'disabled');
          //$('form').bind('submit',function(e){e.preventDefault();});
        }
  },
  'blur #profile-username' (event, template) {
    //TO DO: make sure current user name is excluded from search on serverside
    Meteor.call('updateUsernameIsUnique', event.currentTarget.value, function(error, result) {
      if (error) {
        console.log(error);
      } else {
        if (result) {
          //$('#submitProfile').removeAttr('disabled', 'disabled');
          //$('form').unbind('submit');
          template.templateDictionary.set('urlCompleted',true);
          $("#valid-username").html('<i class="material-icons">check</i>');

        } else {
          $("#valid-username").text("Username exists");
          template.templateDictionary.set('urlCompleted',false);
          //$('#submitProfile').attr('disabled', 'disabled');
          //$('form').bind('submit',function(e){e.preventDefault();});
        }
      }
    });
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
          togglePublic(false, template);
        }
    }else{
      togglePublic(true,template);
      //False - check if form is complete
      /*if(Session.get('profileIsComplete')){
        //enable delegate button
        togglePublic(true);
      }else{
        //profile incomplete message
        msg = "Profile is incomplete";
        Bert.alert(msg, 'danger');
      }*/

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
  /* Candidate feature disable for now
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
  */
  'submit form' (event, template) {
    event.preventDefault();
  },
  'click #profile-status-link' (){
    event.preventDefault();
    if(Session.get('showCompleteStatus')){
      $( "#profile-status-complete" ).hide();
      $( "#profile-status-link" ).html('<i class="material-icons">expand_more</i>');
    }else{
      $( "#profile-status-complete" ).show();
       $( "#profile-status-link" ).html('<i class="material-icons">expand_less</i>');
    }
    Session.set('showCompleteStatus',!Session.get('showCompleteStatus'));
  }
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
            username: template.find('[name="profileUsername"]').value,
            firstName: template.find('[name="profileFirstName"]').value,
            lastName: template.find('[name="profileLastName"]').value,
            photo: template.find('[name="profilePhotoPath"]').value,
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
  totalScore: function(){
    //remember to check if type is entity as only uses firstname (thus return 6), individual requires firstname and lastname (thus 7)
    if(Template.instance().type.get()=='Entity'){
      return 6;
    }
    return 7;
  },
  photoCompleted: function(){
    return Template.instance().templateDictionary.get('photoCompleted');
  },
  usernameCompleted: function(){
    return Template.instance().templateDictionary.get('usernameCompleted');
  },
  firstnameCompleted: function(){
    //remember to check if type is entity as only uses firstname, individual requires firstname and lastname
    return Template.instance().templateDictionary.get('firstnameCompleted');
  },
  lastnameCompleted: function(){
    //remember to check if type is entity as only uses firstname, individual requires firstname and lastname
    return Template.instance().templateDictionary.get('lastnameCompleted');
  },
  urlCompleted: function(){
    return Template.instance().templateDictionary.get('urlCompleted');
  },
  bioCompleted: function(){
    return Template.instance().templateDictionary.get('bioCompleted');
  },
  bioCount: function(){
    return Template.instance().templateDictionary.get('bioCount');
  },
  tagsCompleted: function(){
    return Template.instance().templateDictionary.get('tagsCompleted');
  },
  tagsCount: function(){
    return Template.instance().templateDictionary.get('tagsCount');
  },
  completedScore: function(){
    return Template.instance().templateDictionary.get('completedScore');
  },
  profile: function() {
    user = Meteor.users.findOne({ _id: Meteor.userId() }, { fields: { profile: 1, roles: 1, isPublic: 1, isParty: 1, isOrganisation: 1 } });
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
  isEntity: function() {
    var type = Template.instance().type.get();
    //console.log(type);
    if (type == 'Entity') {
      //console.log("should be hidden");
      return true;
    }
    //console.log("show lastname");
    return false;
  },
  isPublic: function() {
    return Meteor.user().isPublic;
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
      status = TAPi18n.__('generic.approved');
    } else {
      status = false;//Template.instance().delegateStatus.get()
      if (status == TAPi18n.__('generic.approved')){
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
      status = TAPi18n.__('generic.approved');
    } else {
      status = Template.instance().candidateStatus.get()
      if (status == TAPi18n.__('generic.approved')){
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
  settingsText: function() {
    if(Session.get('showSettings')){
      return TAPi18n.__('generic.show-less');
    }
    return TAPi18n.__('generic.show-more');;
  }

});

function hasOwnProperty(obj, prop) {
  var proto = obj.__proto__ || obj.constructor.prototype;
  return (prop in obj) &&
    (!(prop in proto) || proto[prop] !== obj[prop]);
}

function checkProfileIsComplete(template){
  var completedScore = 0;
  var isComplete = false;
  
  //var template = Template.instance();
  var profile = {
    username: template.find('[name="profileUsername"]').value,
    firstName: template.find('[name="profileFirstName"]').value,
    lastName: template.find('[name="profileLastName"]').value,
    photo: template.find('[name="profilePhotoPath"]').value,
    bio: template.find('[name="profileBio"]').value,
    website: template.find('[name="profileWebsite"]').value,
    tags: template.taggle.get().getTagValues()
  };
  
  var profileFields = _.keys(profile);
  public = profile;
  var bio = event.currentTarget.value;

  //1. Check username: 
  if(template.templateDictionary.get('usernameCompleted')){
    completedScore++;
  }

  //2. Check Firstname
  if(profile.firstName.length){
    template.templateDictionary.set('firstNameCompleted',true);
    completedScore++;
  }else{
    template.templateDictionary.set('firstNameCompleted',false);
  }

  //3. Check if Individual: check lastname
  if(profile.firstName.length){
    template.templateDictionary.set('lastnameCompleted',true);
    completedScore++;
  }else{
    template.templateDictionary.set('lastnameCompleted',false);
  }

  //4. Check photo: MAY NOT BE NECCESSARY
  if(profile.photo.length){
    template.templateDictionary.set('photoCompleted',true);
    completedScore++;
  }else{
    template.templateDictionary.set('photoCompleted',false);
  }

  //5. Check bio: 
  template.templateDictionary.set('bioCount',profile.bio.length);
  if((profile.bio.length >= 50)&&(profile.bio.length <=160)){
    template.templateDictionary.set('bioCompleted',true);
    completedScore++;
  }else{
    template.templateDictionary.set('bioCompleted',false);
  }
  //6. Check website: ADD CHECK FOR VALID URL
  if(profile.website.length){
    template.templateDictionary.set('urlCompleted',true);
    completedScore++;
  }else{
    template.templateDictionary.set('urlCompleted',false);
  }

  //7. Check tags: NOTE! Something a bit iffy with template.taggle.get().getTagValues()
  //console.log(profile.tags);
  //console.log(template.taggle.get().getTagValues());
  template.templateDictionary.set('tagsCount',profile.tags.length);
  if (profile.tags.length >= 5){
    template.templateDictionary.set('tagsCompleted',true);
    completedScore++;
  }else{
    template.templateDictionary.set('tagsCompleted',false);
  }
  template.templateDictionary.set('completedScore',completedScore);

  //8. Calculate score total based on profile type (individual = 7, entity = 6)
  var profileType = template.templateDictionary.get('profileType');
  var totalScore = 7;
  if(profileType == 'Entity'){
    totalScore = 6;
  }
  
  //9. Update progress bar
  var percentage = completedScore * 100 / totalScore + '%';
  $('#progress-status').width(percentage);


  /*
  template.templateDictionary.set('tagsCompleted', profile.tags.length);
  if (profile.tags.length < 5){
    console.log("not enough tags");

    isComplete = false;
  } else {
    _.map(profileFields, function(field){
      if (profile[field].length == 0){
        isComplete = false;
        console.log("empty field: " + profile[field]);
      } 
    });
  }
  */
  if(completedScore==totalScore){
    isComplete = true;
  }
  //console.log("completedScore: " + completedScore + " totalScore: " + totalScore + " isComplete");
  return isComplete;
}

function isInRole(role){
  return Roles.userIsInRole(Meteor.user(), role);
}

function updateDisplayedStatus(type, template){
  //console.log('updateDisplayedStatus is running with type ' + type)
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
  var publicSwitch = template.find('#profile-public-switch-label').MaterialSwitch;
  var delegateSwitch = template.find('#profile-delegate-switch-label').MaterialSwitch;
  if(!checkProfileIsComplete(template)){
    //console.log("profile is incomplete, disabling public toggle");
    //publicSwitch.disable();
    delegateSwitch.disable();
    return;
  }
  if (isInRole('candidate') || isInRole('delegate')){
    //console.log("user is delegate/candidate, disabling public toggle");
    publicSwitch.disable();
  } else {
    //console.log("enabling public toggle");
    publicSwitch.enable();
  }
  if( Meteor.user().isPublic) {
    //console.log("user isPublic, turning toggle on");
    publicSwitch.on();
    delegateSwitch.enable();
  } else {
    //console.log("user isPublic, turning toggle off");
    publicSwitch.off();
    delegateSwitch.disable();
  }
}

function togglePublic(isPublic,template){
  var publicSwitch = template.find('#profile-public-switch-label').MaterialSwitch;
  Meteor.call('togglePublic', Meteor.userId(), isPublic, function(error) {
    if (error) {
      Bert.alert(error.reason, 'danger');
      publicSwitch.off();
    } else {
      var msg = TAPi18n.__('pages.profile.alerts.profile-private');
      publicSwitch.off();
      if (Meteor.user().isPublic) {
        msg = TAPi18n.__('pages.profile.alerts.profile-public');
        publicSwitch.on();
      }
      Bert.alert(msg, 'success');
    }
  });
}


function validateUrl(url){
  var regExp = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm;
  return regExp.test(url);
}