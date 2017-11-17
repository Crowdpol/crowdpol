import "./profileForm.html"
import { setupTaggle } from '../../components/taggle/taggle.js'

Template.ProfileForm.onRendered(function(){
  var self = this;
  self.taggle = new ReactiveVar(setupTaggle());
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
  'submit form' (event, template) {
    console.log("submit clicked");
    event.preventDefault();
  },

  'blur #profile-username' (event, template) {
    Meteor.call('updateUsernameIsUnique', event.currentTarget.value, function(error, result) {
      if (error) {
        console.log(error);
      } else {
        if (result) {
          $('#submitProfile').removeAttr('disabled', 'disabled');
          //$('form').unbind('submit');
          $("#valid-username").html("&#10003;");
        } else {
          $("#valid-username").text("Username exists");
          $('#submitProfile').attr('disabled', 'disabled');
          //$('form').bind('submit',function(e){e.preventDefault();});
        }
      }
    });
  },

  /*
  'submit form' (event, template){

    event.preventDefault();
    let profile = {
      username: template.find('[name="profile-username"]').value,
      firstName: template.find('[name="profile-firstname"]').value,
      lastName: template.find('[name="profile-lastname"]').value,
      photo: template.find('[name="profile-photo-path"]').value,
      bio: template.find('[name="profile-bio"]').value,
      website: template.find('[name="profile-website"]').value
    };
    Meteor.call('updateProfile',Meteor.userId(), profile, function(error){
      if (error){
        Bert.alert(error.reason, 'danger');
      } else {
        //template.find('#profile-form').reset();
        Bert.alert(TAPi18n.__('pages.profile.alerts.profile-updated'), 'success');
      }
    });
  }
  */
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
      profilePhotoPath: {
        url: true
      }
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
  }
});

function hasOwnProperty(obj, prop) {
  var proto = obj.__proto__ || obj.constructor.prototype;
  return (prop in obj) &&
    (!(prop in proto) || proto[prop] !== obj[prop]);
}

function checkProfileIsComplete(){
  var template = Template.instance();
  var profile = {
    username: template.find('[name="profileUsername"]').value,
    firstName: template.find('[name="profileFirstName"]').value,
    lastName: template.find('[name="profileLastName"]').value,
    photo: template.find('[name="profilePhotoPath"]').value,
    bio: template.find('[name="profileBio"]').value,
    website: template.find('[name="profileWebsite"]').value,
    tags: template.taggle.get().getTagValues()
  };
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