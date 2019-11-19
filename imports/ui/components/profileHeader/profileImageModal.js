import Images from '/lib/images.collection.js';
//import { validFileURL } from '../../../../startup/server/functions.js';
import "./profileImageModal.html"

Template.ProfileImageModal.onCreated(function(){

  self = this;
  /*
  //Local Storage
  var communityId = LocalStore.get('communityId');
  //Session variables
  Session.set('variableName','variableValue');
  //Reactive Variables
  self.reactiveVariable = new ReactiveVar([]);
  self.reactiveVariable.set("exampleData");
  //Reactive Dictionary
  var dict = new ReactiveDict();
  this.templateDictionary = dict;
  dict.set("communityId",LocalStore.get('communityId'));
  //subscriptions
  self.autorun(function() {
    self.subscribe("simpleSearch",Session.get('searchPhrase'),"delegate", communityId);
  });
  */
  self.currentUpload = new ReactiveVar(false);
  self.currentSelection = new ReactiveVar('/img/default-user-image.png');
});

Template.ProfileImageModal.onRendered(function(){

});

Template.ProfileImageModal.events({
  /*
	'keyup #some-id': function(event, template){
		Session.set('searchPhrase',event.target.value);
	},
  'click .some-class': function(event, template){
    var communityId = Template.instance().templateDictionary.get( 'communityId' );
    delegateId = this._id;
    var ranks = Session.get('ranked');
    let settings = LocalStore.get('settings');
    let delegateLimit = -1;

    if(typeof settings != 'undefined'){
      //do something
    }
    Meteor.call('someMethod', someParameter, function(error, result){
      if(error) {
        RavenClient.captureException(error);
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert(TAPi18n.__('pages.delegates.alerts.ranking-updated'), 'success');
      }
    });
  },
  */
  'click #overlay, click #reject-button' (event, template){
    closeProfileImageModal();
  },
	'click #approve-button' (event, template){
		closeProfileImageModal();
	},
  'change #fileInput': function (e, template) {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      // We upload only one file, in case
      // there was multiple files selected
      var file = e.currentTarget.files[0];
      if (file) {
        var uploadInstance = Images.insert({
          file: file,
          streams: 'dynamic',
          chunkSize: 'dynamic'
        }, false);

        uploadInstance.on('start', function() {
          template.currentUpload.set(this);
        });

        uploadInstance.on('end', function(error, fileObj) {
          if (error) {
            Bert.alert('Error during upload: ' + error.reason,'danger');
          } else {
            console.log(fileObj);
            Bert.alert('File "' + fileObj.name + '" successfully uploaded','success');
          }
          template.currentUpload.set(false);
        });

        uploadInstance.start();
      }
    }
  },
  'keyup #profilePhoto, paste #profilePhoto, blur #profilePhoto' (event, template){
    var path = $("input#profilePhoto").val();
    var obj = new Image();
    obj.src = path;
    if (obj.complete) {
        $('img#profile-pic').prop('src', path);
        $("#valid-photo-path").html("");
        $('#profile-photo-path').val(path);
				let imageURLText = "url(" + path + ")";
				$('.profile-pic').css("background-image",imageURLText);
				Session.set('selectedImage',path);
    } else {
        $("#valid-photo-path").html("Invalid photo path");
    }
  },
  'click .wizard-avatar-preview'(event, template){
    $(".wizard-avatar-preview.selected").removeClass("selected");
    $(event.currentTarget).addClass("selected");

    let image = $(event.currentTarget).css('background-image');
    url = image.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
    console.log(url);
    Template.instance().currentSelection.set(url);
    $('.profile-pic').css("background-image",image);
  },
  'click .profile-image-modal-close' (event, template){
    closeProfileImageModal();
  },
  'click .profile-image-modal-set' (event,template){
    closeProfileImageModal();
  }
});

Template.ProfileImageModal.helpers({
  photo: function () {
    return Session.get("photo");
  },
  currentUpload: function () {
    return Template.instance().currentUpload.get();
  },
  uploadedUserFiles: function () {
    return Images.find({"userId":Meteor.userId()});
  },
  currentSelection: function () {
    return Template.instance().currentSelection.get();
  },
  validImagePath: function (file) {
    if(file){
      console.log(file);
      /*
      if(validFileURL(file)){
        return true;
      }
      */
    }
    return true;
  }
});

export function showProfileImageModal(){
  console.log("open me");
  $(".profile-image-modal").addClass('active');
  $("#overlay").addClass('dark-overlay');
}

export function closeProfileImageModal(){
  $(".profile-image-modal").removeClass('active');
  $("#overlay").removeClass('dark-overlay');
  Session.set("selectedImage",$("#profile-image-selection").val());
  console.log("close me");
}

export function getSelectedImage(){
  console.log('$("#profile-image-selection").val() : ' + $("#profile-image-selection").val());
  return $("#profile-image-selection").val();
}
