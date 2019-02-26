import "./profileForm.html"
//import { setupTaggle } from '../../components/taggle/taggle.js'
import RavenClient from 'raven-js';

Template.ProfileForm.onCreated(function() {
  ////console.log("onCreated started");
  var self = this;
  self.isDataReady = new ReactiveVar(false);
  //set reactive vars
  var dict = new ReactiveDict();
  let userData = Meteor.user();
  ////console.log("checker reactive vars set");
  dict.set('completedScore', 0);
  dict.set('photoCompleted', true);
  dict.set('usernameCompleted', false);
  dict.set('firstnameCompleted', false);
  dict.set('lastnameCompleted', false);
  dict.set('phoneNumberCompleted', false);
  dict.set('contactPersonCompleted', false);
  dict.set('urlCompleted', false);
  dict.set('bioCompleted', false);
  dict.set('bioCount', 0);
  dict.set('tagsCompleted', false);
  dict.set('tagsCount', 0);
  //console.log("Setting reactive vars from Meteor.user()");
  dict.set('isPublic', userData.isPublic);
  dict.set('username', userData.profile.username);
  dict.set('firstname', userData.profile.firstName);
  dict.set('lastname', userData.profile.lastName);
  dict.set('bio', userData.profile.bio);
  dict.set('website', userData.profile.website);
  dict.set('type', userData.profile.type);
  dict.set('credentials', userData.profile.credentials);
  dict.set('showPublic', userData.isPublic);
  dict.set('profileType', userData.profile.type);
  dict.set('phoneNumber', userData.profile.phoneNumber);
  dict.set('contactPerson', userData.profile.contactPerson);
  dict.set('photo',userData.profile.photo);
  /*
  if (hasOwnProperty(userData.profile,"photo")) {
    dict.set('photo',userData.profile.photo);
  } else {
    dict.set('photo',"/img/default-user-image.png");
  }*/
  this.dict = dict;
  ////console.log("reactive vars set");
  self.autorun(function() {
    ////console.log("onCreated autorun started");
    //self.subscribe('user.current');
    //self.subscribe('users.usernames');
    /*
    var dict = new ReactiveDict();
    dict.set('completedScore', 0);
    dict.set('photoCompleted', true);
    dict.set('usernameCompleted', false);
    dict.set('firstnameCompleted', false);
    dict.set('lastnameCompleted', false);
    dict.set('phoneNumberCompleted', false);
    dict.set('contactPersonCompleted', false);
    dict.set('urlCompleted', false);
    dict.set('bioCompleted', false);
    dict.set('bioCount', 0);
    dict.set('tagsCompleted', false);
    dict.set('tagsCount', 0);
    //console.log("onCreated: reactive vars set");

    Meteor.call('getProfile', Meteor.userId(), function(error, result) {
      if (error) {
        RavenClient.captureException(error);
        Bert.alert(error.reason, 'danger');
      } else {
        ////console.log(result);
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
        //console.log("result.profile.phoneNumber: " + result.profile.phoneNumber);
        /*if (hasOwnProperty(result.profile,"photo")) {
          dict.set('photo', result.profile.photo);
        } else {
          dict.set('photo', "/img/default-user-image.png");
        }
        dict.set('photo', "/img/default-user-image.png");
        //console.log("onCreated: getProfile method returned, reactive vars reset with response");
      }
    });
    */

  });
  self.isDataReady.set(true);
  //console.log("isDataReady set to true");
  //console.log("onCreated ended");
});

Template.ProfileForm.events({
  'keyup input, keyup textarea' (event, template){
    let profileType = Template.instance().dict.get('profileType');
    //console.log("profileType: " + profileType);
    Session.set('profileIsComplete', checkProfileIsComplete(template,profileType));
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
          template.dict.set('urlCompleted',true);
          $("#valid-url").html('<i class="material-icons">check</i>');

        } else {
          template.dict.set('urlCompleted',false);
          $("#valid-url").text("");
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
  //console.log("onRendered started");
  var self = this;
  //self.delegateStatus = new ReactiveVar(false);
  //self.candidateStatus = new ReactiveVar(false);
  /*
  const handle = Meteor.subscribe('users.current');
  */

  //console.log(this.dict.get("completedScore"));
  Tracker.autorun(() => {
    //console.log("onRendered: autorun started");
    //const isReady = handle.ready();

    //if (isReady){
      //self.isDataReady.set(true);
      // Set public/private switch
      //updatePublicSwitch(self);
      // Set approval statuses and switches
      //self.delegateStatus.set(updateDisplayedStatus('delegate', self));
      //self.candidateStatus.set(updateDisplayedStatus('candidate', self));
      //console.log("check if profile is complete, this should run after all data is loaded");
      Session.set('profileIsComplete', checkProfileIsComplete(self,Template.instance().dict.get('profileType')));
      //console.log("onRendered: autorun ended");
    //}
  });



  let template = Template.instance();
  //console.log("username validator being called");
  $.validator.addMethod('usernameUnique', (username) => {
    ////console.log("checkusername: " + checkUsername(username));
    return checkUsername(username);
  });

  $("#profile-form").validate({
    rules: {
      profileUsername: {
        required: true,
        minlength: 3,
        maxlength: 64,
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
      let profileType = template.dict.get('profileType');
      if(profileType == 'Entity'){
        var profile = {
          username: template.find('[name="profileUsername"]').value,
          firstName: template.find('[name="profileFirstName"]').value,
          photo: template.find('[name="profilePhotoPath"]').value,
          bio: template.find('[name="profileBio"]').value,
          website: template.find('[name="profileWebsite"]').value,
          phoneNumber: template.find('[name="profilePhoneNumber"]').value,
          contactPerson: template.find('[name="profileContactPerson"]').value,
          credentials: template.dict.get('credentials'),
          type: template.dict.get("type"),
        };
      }else{
        var profile = {
          username: template.find('[name="profileUsername"]').value,
          firstName: template.find('[name="profileFirstName"]').value,
          lastName: template.find('[name="profileLastName"]').value,
          photo: template.find('[name="profilePhotoPath"]').value,
          bio: template.find('[name="profileBio"]').value,
          website: template.find('[name="profileWebsite"]').value,
          credentials: template.dict.get('credentials'),
          type: template.dict.get("type"),
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
  //console.log("onRendered ended");
});

Template.ProfileForm.helpers({
  isDataReady: function(template){
    //console.log("isDataReady called");
    //updateFormLabels();
    return Template.instance().isDataReady.get();
  },
  totalScore: function(){
    //remember to check if type is entity as only uses firstname (thus return 6), individual requires firstname and lastname (thus 7)
    if(Template.instance().dict.get('type')=='Entity'){
      return 6;
    }
    return 5;
  },
  photoCompleted: function(){
    return Template.instance().dict.get('photoCompleted');
  },
  usernameCompleted: function(){
    return Template.instance().dict.get('usernameCompleted');
  },
  firstnameCompleted: function(){
    //remember to check if type is entity as only uses firstname, individual requires firstname and lastname
    ////console.log(Template.instance().dict.get('firstnameCompleted'));
    return Template.instance().dict.get('firstnameCompleted');
  },
  lastnameCompleted: function(){
    //remember to check if type is entity as only uses firstname, individual requires firstname and lastname
    return Template.instance().dict.get('lastnameCompleted');
  },
  urlCompleted: function(){
    return Template.instance().dict.get('urlCompleted');
  },
  phoneNumberCompleted: function(){
    //console.log("phonenumber set");
    return Template.instance().dict.get('phoneNumberCompleted');
  },
  contactPersonCompleted: function(){
    return Template.instance().dict.get('contactPersonCompleted');
  },
  bioCompleted: function(){
    return Template.instance().dict.get('bioCompleted');
  },
  bioCount: function(){
    return Template.instance().dict.get('bioCount');
  },
  /*
  tagsCompleted: function(){
    return Template.instance().dict.get('tagsCompleted');
  },

  tagsCount: function(){
    return Template.instance().dict.get('tagsCount');
  },
    */
  completedScore: function(){
    return Template.instance().dict.get('completedScore');
  },
  profile: function() {
    user = Meteor.users.findOne({ _id: Meteor.userId() }, { fields: { profile: 1, roles: 1, isPublic: 1, isParty: 1, isOrganisation: 1 } });
    return user.profile;
  },
  profilePic: function() {
    return Session.get('photoURL');
  },
  firstName: function() {
    return Template.instance().dict.get('firstname');
  },
  lastName: function() {
    return Template.instance().dict.get('lastname');
  },
  username: function() {
    return Template.instance().dict.get('username');
  },
  bio: function() {
    return Template.instance().dict.get('bio');
  },
  website: function() {
    return Template.instance().dict.get('website');
  },
  phoneNumber: function() {
    return Template.instance().dict.get('phoneNumber');
  },
  contactPerson: function() {
    return Template.instance().dict.get('contactPerson');
  },
  type: function() {
    //return Template.instance().dict.get('type');
    return Template.instance().dict.get("type");
  },
  isEntity: function() {
    //console.log("setting entity type");
    var type = Template.instance().dict.get("type");
    if (type == 'Entity') {
      return true;
    }
    return false;
  },
  isIndividual: function() {
    var type = Template.instance().dict.get("type");
    if (type == 'Entity') {
      return false;
    }
    return true;
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

Template.ProfileSettingsForm.onCreated(function() {
  var self = this;
  var dictionary = new ReactiveDict();
  dictionary.set('approvalStatus', 'Off');
  userData = Meteor.user();
  //check if user object has approvals property
  for ( var prop in userData ) {
      if(hasOwnProperty(userData,"approvals")){
        ////console.log("userData has approvals");
        approvals = userData.approvals;
        //loop through approvals and check for delegate requests
        approvals.forEach(function (approval, index) {
          if(approval.type=="delegate"){
            dictionary.set('approvalStatus', approval.status);
          }
        });
      }
  }
  this.dict = dictionary;
});

Template.ProfileSettingsForm.events({
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
      approvalStatus = Template.instance().dict.get('approvalStatus');
      if(approvalStatus=='Requested'){
        Meteor.call('removeRequest', Meteor.userId(), 'delegate', function(error) {
          if (error) {
            RavenClient.captureException(error);
            Bert.alert(error.reason, 'danger');
            updateDisplayedStatus('delegate', template)
          } else {
            var msg = TAPi18n.__('pages.profile.alerts.profile-delegate-request-removed');
            //$("#profile-delegate-switch").addClass("switch-disabled");
            template.dict.set('approvalStatus','');
            Bert.alert(msg, 'success');

          }
        });
        return;
      }
      // Profile is complete, submit approval request
      Meteor.call('requestApproval', Meteor.userId(), 'delegate', function(error) {
        if (error) {
          RavenClient.captureException(error);
          Bert.alert(error.reason, 'danger');
          updateDisplayedStatus('delegate', template);
          document.getElementById("profile-delegate-switch").checked = false;
        } else {
          var msg = TAPi18n.__('pages.profile.alerts.profile-delegate-requested');
          $("#profile-delegate-switch").addClass("switch-disabled");
          template.dict.set('approvalStatus','Requested');
          Bert.alert(msg, 'success');
        }
      });
    }
  }
});

Template.ProfileSettingsForm.helpers({
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
  delegateStatus: function() {
    var status='';
    if(isInRole('delegate')){
      status = TAPi18n.__('generic.approved');
    } else {
      approvalStatus = Template.instance().dict.get('approvalStatus');
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
  delegateChecked: function() {
    if(isInRole('delegate')){
      return true;
    }else{
      approvalStatus = Template.instance().dict.get('approvalStatus');
      if(approvalStatus=='Requested'){
        return true;
      }
      //if approval status set return it, or return "off"
      ////console.log(approvalStatus);
    }
    return false;
  },
  delegateSwitchClass: function(){
    approvalStatus = Template.instance().dict.get('approvalStatus');
    if(approvalStatus=='Requested'){
      return "switch-disabled";
    }
  }
});

function hasOwnProperty(obj, prop) {
  var proto = obj.__proto__ || obj.constructor.prototype;
  return (prop in obj) &&
    (!(prop in proto) || proto[prop] !== obj[prop]);
}

function checkProfileIsComplete(template,profileType){
  //console.clear();
  //console.log("profileType: " + profileType);
  //console.log("starting complete check");
  //updateFormLabels();
  var completedScore = 0;
  var isComplete = false;

  var totalScore = 5;
  ////console.log(template.find('[name="profilePhoneNumber"]'));
  if(profileType == 'Entity'){
    //console.log("i am an entity");
    var totalScore = 6;
    var phoneNumber = $('[name="profilePhoneNumber"]').val();
    if(typeof phoneNumber == 'undefined'){
      phoneNumber = '';
      //console.log("undefined phoneNumber: " + phoneNumber);
    }else{
      //console.log("defined phoneNumber: " + phoneNumber);
    }
    var contactPerson = $('#profile-contact-person').val();
    if(typeof contactPerson == 'undefined'){
      contactPerson = '';
    }
    //console.log("about to populate profile");
    //console.log($("#profile-username"));
    var profile = {
      username: $("#profile-username").val(),//template.find('[name="profileUsername"]').value,
      firstName: $("#profileFirstName").val(),//template.find('[name="profileFirstName"]').value,
      photo: $("#profile-photo-path").val(),//template.find('[name="profilePhotoPath"]').value,
      bio: $("#profile-bio").val(),//template.find('[name="profileBio"]').value,
      website: $("#profile-website").val(),//template.find('[name="profileWebsite"]').value,
      phoneNumber: phoneNumber,
      contactPerson: contactPerson,
      //tags: template.taggle.get().getTagValues()
    };

  }else{
    //var template = Template.instance();
    var profile = {
      username: $("#profile-username").val(),//template.find('[name="profileUsername"]').value,
      firstName: $("#profileFirstName").val(),//template.find('[name="profileFirstName"]').value,
      lastName: $("#profile-lastname").val(),//template.find('[name="profileLastName"]').value,
      photo: $("#profile-photo-path").val(),//template.find('[name="profilePhotoPath"]').value,
      bio: $("#profile-bio").val(),//template.find('[name="profileBio"]').value,
      website: $("#profile-website").val(),//template.find('[name="profileWebsite"]').value,
    };
  }
  //console.log(profile);
  public = profile;
  var bio = event.currentTarget.value;

  //1. Check username:
  if(profile.username.length){
    ////console.log("username completed: " + checkUsername(profile.username));
    completedScore++;
    template.dict.set('usernameCompleted',true);
  }else{
    ////console.log("username incomplete: " + checkUsername(profile.username));
    template.dict.set('usernameCompleted',false);
  }
  ////console.log(template.dict);
  //2. Check Firstname
  if(profile.firstName.length){
    template.dict.set('firstnameCompleted',true);
    completedScore++;
    ////console.log("firstname completed");
  }else{
    template.dict.set('firstnameCompleted',false);
    ////console.log("firstname incomplete");
  }
  if(profileType == 'Entity'){
    //check phone number
    //console.log("profile.phoneNumber: " + profile.phoneNumber);
    //console.log("$('[name=profilePhoneNumber]').val(): " + $('[name="profilePhoneNumber"]').val());
    //console.log("$('#profile-phone-number').val(): " + $('#profile-phone-number').val());
    if(profile.phoneNumber.length){
      ////console.log('phoneNumber valid');
      template.dict.set('phoneNumberCompleted',true);
      completedScore++;
      ////console.log("phonenumber completed");
    }else{
      ////console.log('phoneNumber invalid');
      template.dict.set('phoneNumberCompleted',false);
      //console.log("phonenumber incomplete");
    }
    //check contact profileContactPerson
    if(profile.contactPerson.length){
      template.dict.set('contactPersonCompleted',true);
      completedScore++;
      ////console.log("contact person completed");
    }else{
      template.dict.set('contactPersonCompleted',false);
      //console.log("contact person incomplete");
    }
  }else{
    //3. Check if Individual: check lastname
    if(profile.lastName.length){
      template.dict.set('lastnameCompleted',true);
      completedScore++;
      ////console.log("last name completed");
    }else{
      template.dict.set('lastnameCompleted',false);
      //console.log("lastname not complete");
    }
  }
  /*
  //4. Check photo: MAY NOT BE NECCESSARY
  if(profile.photo.length){
    template.dict.set('photoCompleted',true);
    completedScore++;
    //console.log("photo completed");
  }else{
    template.dict.set('photoCompleted',false);
    //console.log("photo incomplete");
  }
  */
  //5. Check bio:
  template.dict.set('bioCount',profile.bio.length);
  if((profile.bio.length >= 50)&&(profile.bio.length <=520)){
    template.dict.set('bioCompleted',true);
    completedScore++;
    ////console.log("bio complete");
  }else{
    template.dict.set('bioCompleted',false);
    ////console.log("bio incomplete");
  }
  //6. Check website: ADD CHECK FOR VALID URL
  if(profile.website.length){
    template.dict.set('urlCompleted',true);
    completedScore++;
    ////console.log("url complete");
  }else{
    template.dict.set('urlCompleted',false);
    ////console.log("url incomplete");
  }
  ////console.log("completedScore: "+completedScore);
  template.dict.set('completedScore',completedScore);

  //8. Calculate score total based on profile type (individual = 6, entity = 5)
  //var profileType = template.dict.get('profileType');
  ////console.log("completedScore: " + completedScore);

  //9. Update progress bar
  //console.log("completedScore: " + completedScore + " totalScore: " + totalScore);
  var percentage = completedScore * 100 / totalScore + '%';
  $('#progress-status').width(percentage);


  /*
    var profileFields = _.keys(profile);
  template.dict.set('tagsCompleted', profile.tags.length);
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
  if(hasOwnProperty(Meteor.user(),"approvals")){
    var approvals = Meteor.user().approvals
    if (approvals) {
      var currentApproval = approvals.find(approval => approval.type === type)
      if (currentApproval){
        return status;
      }
    }
  }else{
    //console.log("could not find approvals");
    return "";
  }

}

function updatePublicSwitch(template){
  var publicSwitch = template.find('#profile-public-switch-label');//.MaterialSwitch;
  var delegateSwitch = template.find('#profile-delegate-switch-label');//.MaterialSwitch;
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

function checkUsername(username){
  ////console.log("checking username: " + username);
  let exists = Meteor.users.findOne({"_id":{$ne: Meteor.userId()},"profile.username": username});
  ////console.log(exists);
  return exists ? false : true;
}

function updateFormLabels(){
  //Go through mdl inputs and check if dirty
  var form = document.forms["profile-form"];
  //console.log(form);
  var formElements = document.forms["profile-form"].elements;//getElementByClassName('.mdl-js-textfield');
  for (var i = 0, l = formElements.length; i < l; i++) {
    if(formElements[i].classList.contains('mdl-textfield__input')){
      console.log(formElements[i].value);
      formElements[i].focus();
      formElements[i].parentNode.classList.add('is-dirty');
    }
    /*
    var classes = mdlInputs[i].getAttribute('class') + " is-dirty";
    //console.log(classes);
    var nodes = mdlInputs[i].querySelector('input,textarea');
    //console.log(nodes);
    mdlInputs[i].setAttribute('class', classes);
    mdlInputs[i].addClass("is-dirty");
    mdlInputs[i].get(0).MaterialTextfield.checkDirty();
    */
  }
}
