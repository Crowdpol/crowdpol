import "./profileForm.html"
//import { setupTaggle } from '../../components/taggle/taggle.js'
import RavenClient from 'raven-js';


Template.ProfileForm.onCreated(function() {
  var self = this;
  self.type = new ReactiveVar("Waiting for response from server...");

  self.autorun(function() {
    self.subscribe('user.current');
    self.subscribe('users.usernames');
  });
  var dict = new ReactiveDict();
  dict.set('completedScore', 0);
  dict.set('photoCompleted', true);
  dict.set('usernameCompleted', true);
  dict.set('firstnameCompleted', true);
  dict.set('lastnameCompleted', false);
  dict.set('phoneNumberCompleted', false);
  dict.set('contactPersonCompleted', false);
  dict.set('urlCompleted', false);
  dict.set('bioCompleted', false);
  dict.set('bioCount', 0);
  dict.set('tagsCompleted', false);
  dict.set('tagsCount', 0);

  Meteor.call('getProfile', Meteor.userId(), function(error, result) {
    if (error) {
      RavenClient.captureException(error);
      Bert.alert(error.reason, 'danger');
    } else {
      console.log(result);
      dict.set('isPublic', result.isPublic);
      dict.set('username', result.profile.username);
      //self.find(`[name="profileFirstName"]`).value = result.profile.firstName || '';
      dict.set('firstname', result.profile.firstName);
      dict.set('lastname', result.profile.lastName);
      dict.set('bio', result.profile.bio);
      dict.set('website', result.profile.website);
      dict.set('isPublic', result.isPublic);
      dict.set('type', result.profile.type);
      dict.set('credentials', result.profile.credentials);
      dict.set('showPublic', result.isPublic);
      dict.set('profileType', result.profile.type);
      dict.set('phoneNumber', result.profile.phoneNumber);
      dict.set('contactPerson', result.profile.contactPerson);
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
    Session.set('profileIsComplete', checkProfileIsComplete(template));
  },
  /*
  'click #show-settings' (event, template) {
    event.preventDefault();
    var showSettings = Session.get('showSettings');
    if (showSettings){
      $( "#public-form-details" ).hide();
    }else{
      $( "#public-form-details" ).show();
    }
    Session.set('showSettings',!showSettings)
  },
  */
  'blur #profile-website' (event, template) {
        if (validateUrl(event.currentTarget.value)) {
          template.templateDictionary.set('urlCompleted',true);
          $("#valid-url").html('<i class="material-icons">check</i>');

        } else {
          template.templateDictionary.set('urlCompleted',false);
          $("#valid-url").text("");
        }
  },
  'click #goPrivate' (event,template){
    if( Meteor.user().isPublic) {
      //True: - go private
        //1 Check if user is delegate
        if (isInRole('delegate')) {
          //true - let user know they cannot go private while delegate
            Bert.alert("Remove delegate role before going private", 'danger');
            if(event.currentTarget.checked){
              $( "#goPrivate" ).prop( "checked", false );
            }
        }else{
          //false - make user private
          togglePublic(false, template);
        }
    }
  },
  'click #goPublic' (event,template){
    if(! Meteor.user().isPublic) {
      togglePublic(true, template);
    }
  },
  'click #profile-public-switch' (event, template) {
    event.preventDefault();

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

    }

  },
  'click #profile-delegate-switch' (event, template) {
    event.preventDefault();
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
      // Profile is complete, submit approval request
      Meteor.call('requestApproval', Meteor.userId(), 'delegate', function(error) {
        if (error) {
          RavenClient.captureException(error);
          Bert.alert(error.reason, 'danger');
          updateDisplayedStatus('delegate', template)
        } else {
          var msg = TAPi18n.__('pages.profile.alerts.profile-delegate-requested');
          Bert.alert(msg, 'success');
        }
      });
    }
  },
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
    var self = this;
  self.delegateStatus = new ReactiveVar(false);
  self.candidateStatus = new ReactiveVar(false);

  //self.taggle = new ReactiveVar(setupTaggle());

  const handle = Meteor.subscribe('users.current');

  Tracker.autorun(() => {
    const isReady = handle.ready();

    if (isReady){
      // Set public/private switch
      //updatePublicSwitch(self);
      // Set approval statuses and switches
      self.delegateStatus.set(updateDisplayedStatus('delegate', self));
      //self.candidateStatus.set(updateDisplayedStatus('candidate', self));
      Session.set('profileIsComplete', checkProfileIsComplete(self));
    }
  });


  //Session.set('showCompleteStatus', false);
  /*
  Meteor.call('getUserTags', Meteor.userId(), function(error, result){
    if (error){
      RavenClient.captureException(error);
      Bert.alert(error.reason, 'danger');
    } else {
      var keywords = _.map(result, function(tag){ return tag.keyword; });
      self.taggle.get().add(keywords);
    }
  });
  */
  let template = Template.instance();
  Session.set('showSettings',false);
  //$( "#public-form-details" ).hide();

/*
  //Go through mdl inputs and check if dirty
  var form = document.forms[2];
  var mdlInputs = form.querySelectorAll('.mdl-js-textfield');
  for (var i = 0, l = mdlInputs.length; i < l; i++) {
    var classes = mdlInputs[i].getAttribute('class') + " is-dirty";
    var nodes = mdlInputs[i].querySelector('input,textarea');
    mdlInputs[i].setAttribute('class', classes);
    //mdlInputs[i].addClass("is-dirty");
    //mdlInputs[i].get(0).MaterialTextfield.checkDirty();
  }
*/
  //$('[name="profileFirstName"]').get(0).MaterialTextfield.change(template.templateDictionary.get('firstname'));

  $.validator.addMethod('usernameUnique', (username) => {
    let exists = Meteor.users.findOne({"_id":{$ne: Meteor.userId()},"profile.username": username});
    return exists ? false : true;
  });

  $("#profile-form").validate({
    rules: {
      profileUsername: {
        required: true,
        minlength: 5,
        maxlength: 16,
        usernameUnique: true

      },
      profileWebsite: {
        url: true
      },
    },
    messages: {
      profileUsername: {
        required: TAPi18n.__('pages.profile.alerts.username'),
        minlength: TAPi18n.__('pages.profile.alerts.username-min'),
        maxlength: TAPi18n.__('pages.profile.alerts.username-max'),
        usernameUnique: TAPi18n.__('pages.profile.alerts.username-unique')
      },
      profileWebsite: {
        url: TAPi18n.__('pages.profile.alerts.invalid-url')
      }
    },
    submitHandler() {
      var communityId = LocalStore.get('communityId');
      /*
      Meteor.call('transformTags', template.taggle.get().getTagValues(), communityId, function(error, proposalTags){
        if (error){
          RavenClient.captureException(error);
          Bert.alert(error, 'reason');
        } else {
          */
      let profileType = template.templateDictionary.get('profileType');
      if(profileType == 'Entity'){
        var profile = {
          username: template.find('[name="profileUsername"]').value,
          firstName: template.find('[name="profileFirstName"]').value,
          photo: template.find('[name="profilePhotoPath"]').value,
          bio: template.find('[name="profileBio"]').value,
          website: template.find('[name="profileWebsite"]').value,
          phoneNumber: template.find('[name="profilePhoneNumber"]').value,
          contactPerson: template.find('[name="profileContactPerson"]').value,
          credentials: template.templateDictionary.get('credentials'),
          type: template.type.get(),
        };
      }else{
        var profile = {
          username: template.find('[name="profileUsername"]').value,
          firstName: template.find('[name="profileFirstName"]').value,
          lastName: template.find('[name="profileLastName"]').value,
          photo: template.find('[name="profilePhotoPath"]').value,
          bio: template.find('[name="profileBio"]').value,
          website: template.find('[name="profileWebsite"]').value,
          credentials: template.templateDictionary.get('credentials'),
          type: template.type.get(),
          //tags: proposalTags
        };
      }
          Meteor.call('updateProfile', profile, function(error) {
            if (error) {
              RavenClient.captureException(error);
              Bert.alert(error.reason, 'danger');
            } else {
              Bert.alert(TAPi18n.__('pages.profile.alerts.profile-updated'), 'success');
            }
          });

        //}
      //});

    }
  });
});

Template.ProfileForm.helpers({
  totalScore: function(){
    //remember to check if type is entity as only uses firstname (thus return 6), individual requires firstname and lastname (thus 7)
    if(Template.instance().type.get()=='Entity'){
      return 7;
    }
    return 6;
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
  phoneNumberCompleted: function(){
    return Template.instance().templateDictionary.get('phoneNumberCompleted');
  },
  contactPersonCompleted: function(){
    return Template.instance().templateDictionary.get('contactPersonCompleted');
  },
  bioCompleted: function(){
    return Template.instance().templateDictionary.get('bioCompleted');
  },
  bioCount: function(){
    return Template.instance().templateDictionary.get('bioCount');
  },
  /*
  tagsCompleted: function(){
    return Template.instance().templateDictionary.get('tagsCompleted');
  },

  tagsCount: function(){
    return Template.instance().templateDictionary.get('tagsCount');
  },
    */
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
  phoneNumber: function() {
    return Template.instance().templateDictionary.get('phoneNumber');
  },
  contactPerson: function() {
    return Template.instance().templateDictionary.get('contactPerson');
  },
  type: function() {
    //return Template.instance().templateDictionary.get('type');
    return Template.instance().type.get();
  },
  isEntity: function() {
    var type = Template.instance().type.get();
    if (type == 'Entity') {
      return true;
    }
    return false;
  },
  isIndividual: function() {
    var type = Template.instance().type.get();
    if (type == 'Entity') {
      return false;
    }
    return true;
  },
  isPublic: function() {
    return Meteor.user().isPublic;
  },
  publicChecked: function() {
    if(Meteor.user().isPublic){
      return "checked";
    }
    return null;
  },
  privateChecked: function() {
    if(!Meteor.user().isPublic){
      return "checked";
    }
    return null;
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
      status = false;
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
      return '<i class="material-icons">expand_less</i>' + TAPi18n.__('generic.show-less');
    }
    return '<i class="material-icons">expand_more</i>' + TAPi18n.__('generic.show-more');;
  }
});

function hasOwnProperty(obj, prop) {
  var proto = obj.__proto__ || obj.constructor.prototype;
  return (prop in obj) &&
    (!(prop in proto) || proto[prop] !== obj[prop]);
}

function checkProfileIsComplete(template){
  //console.log(template);
  var completedScore = 0;
  var isComplete = false;

  let profileType = template.templateDictionary.get('profileType');
  var totalScore = 6;
  //console.log(template.find('[name="profilePhoneNumber"]'));
  if(profileType == 'Entity'){
    var totalScore = 7;
    var phoneNumber = $('[name="profilePhoneNumber"]').val();
    if(typeof phoneNumber == 'undefined'){
      phoneNumber = '';
    }
    var contactPerson = $('#profile-contact-person').val();
    if(typeof contactPerson == 'undefined'){
      contactPerson = '';
    }
    //console.log('phoneNumber: ' + phoneNumber + ', contactPerson: ' + contactPerson);
    //console.log(template.find('[name="profilePhoneNumber"]').value);
    var profile = {
      username: template.find('[name="profileUsername"]').value,
      firstName: template.find('[name="profileFirstName"]').value,
      photo: template.find('[name="profilePhotoPath"]').value,
      bio: template.find('[name="profileBio"]').value,
      website: template.find('[name="profileWebsite"]').value,
      phoneNumber: phoneNumber,
      contactPerson: contactPerson,
      //tags: template.taggle.get().getTagValues()
    };
  }else{
    //var template = Template.instance();
    var profile = {
      username: template.find('[name="profileUsername"]').value,
      firstName: template.find('[name="profileFirstName"]').value,
      lastName: template.find('[name="profileLastName"]').value,
      photo: template.find('[name="profilePhotoPath"]').value,
      bio: template.find('[name="profileBio"]').value,
      website: template.find('[name="profileWebsite"]').value,
      //tags: template.taggle.get().getTagValues()
    };
  }

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
  if(profileType == 'Entity'){

    //check phone number
    //console.log(profile.phoneNumber);
    if(profile.phoneNumber.length){
      //console.log('phoneNumber valid');
      template.templateDictionary.set('phoneNumberCompleted',true);
      completedScore++;
    }else{
      //console.log('phoneNumber invalid');
      template.templateDictionary.set('phoneNumberCompleted',false);
    }
    //check contact profileContactPerson
    if(profile.contactPerson.length){
      template.templateDictionary.set('contactPersonCompleted',true);
      completedScore++;
    }else{
      template.templateDictionary.set('contactPersonCompleted',false);
    }
  }else{
    //3. Check if Individual: check lastname
    if(profile.lastName.length){
      template.templateDictionary.set('lastnameCompleted',true);
      completedScore++;
    }else{
      template.templateDictionary.set('lastnameCompleted',false);
    }
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

  template.templateDictionary.set('completedScore',completedScore);

  //8. Calculate score total based on profile type (individual = 6, entity = 5)
  //var profileType = template.templateDictionary.get('profileType');
  //console.log("completedScore: " + completedScore);

  //9. Update progress bar
  var percentage = completedScore * 100 / totalScore + '%';
  $('#progress-status').width(percentage);


  /*
    var profileFields = _.keys(profile);
  template.templateDictionary.set('tagsCompleted', profile.tags.length);
  if (profile.tags.length < 5){
    isComplete = false;
  } else {
    _.map(profileFields, function(field){
      if (profile[field].length == 0){
        isComplete = false;
      }
    });
  }
  */
  if(completedScore==totalScore){
    isComplete = true;
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
  var publicSwitch = template.find('#profile-public-switch-label').MaterialSwitch;
  var delegateSwitch = template.find('#profile-delegate-switch-label').MaterialSwitch;
  /*
  if(!checkProfileIsComplete(template)){
    publicSwitch.disable();
    delegateSwitch.disable();
    return;
  }
  */
  if (isInRole('candidate') || isInRole('delegate')){
    publicSwitch.disable();
  } else {
    publicSwitch.enable();
  }
  if( Meteor.user().isPublic) {
    publicSwitch.on();
    delegateSwitch.enable();
  } else {
    publicSwitch.off();
    delegateSwitch.disable();
  }
}

function togglePublic(isPublic,template){
  //var publicSwitch = template.find('#profile-public-switch-label').MaterialSwitch;
  Meteor.call('togglePublic', Meteor.userId(), isPublic, function(error) {
    if (error) {
      Bert.alert(error.reason, 'danger');
      //publicSwitch.off();
      $( "#goPrivate" ).prop( "checked", false );
      $( "#goPublic" ).prop( "checked", false );
    } else {
      var msg = TAPi18n.__('pages.profile.alerts.profile-private');
      //publicSwitch.off();
      $( "#goPrivate" ).prop( "checked", false );
      if (Meteor.user().isPublic) {
        msg = TAPi18n.__('pages.profile.alerts.profile-public');
        //publicSwitch.on();
        $( "#goPrivate" ).prop( "checked", true );
        $( "#goPublic" ).prop( "checked", false );
      }
      Bert.alert(msg, 'success');
    }
  });
}


function validateUrl(url){
  var regExp = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm;
  return regExp.test(url);
}
