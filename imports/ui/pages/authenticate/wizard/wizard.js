import { getTags } from '../../../components/taggle/taggle.js'
import { getProfilePic,showProfileUrl } from '../../../components/profileHeader/profileImage.js'
import {map,loadMap,addLayer} from '../../../components/maps/leaflet.js'
import Images from '/lib/images.collection.js';
import RavenClient from 'raven-js';
import './wizard.html';
let steps = [];

Template.Wizard.onCreated(function(){
  self = this;
  //Reactive Variables
  self.currentStep = new ReactiveVar(1);
  self.currentUpload = new ReactiveVar(false);
  self.currentSelection = new ReactiveVar('/img/default-user-image.png');
});

Template.Wizard.onRendered(function(){
  showProfileUrl();
  var picker = new Pikaday({
    field: document.getElementById('profile-dob'),
    firstDay: 1,
    minDate: new Date(1900, 0, 1),
    maxDate: new Date(),
    yearRange: [1900, 2020],
    showTime: false,
    autoClose: true,
    format: 'DD-MMM-YYYY',
    disableDayFn: function(date) {
      return moment().isBefore(moment(date), 'day');
    }
  });
  picker.setDate(new Date());
  //console.log(Meteor.settings)
  let els = document.getElementsByClassName('step');

  Array.prototype.forEach.call(els, (e) => {
    steps.push(e);
  });
  setStep = FlowRouter.getParam("id");
  if(setStep){
    this.currentStep = setStep;
    progressSetStep(setStep);
    setStep = setStep -1
    els[setStep].classList.add('selected');
  }
  els[0].classList.add('selected');
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition,showError);
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
  var mdlInputs = document.querySelectorAll('.mdl-js-textfield');
    for (var i = 0, l = mdlInputs.length; i < l; i++) {
      console.log(mdlInputs[i]);
      console.log(mdlInputs[i].MaterialTextfield);
      console.log(mdlInputs[i].MaterialTextfield.checkDirty());
      mdlInputs[i].MaterialTextfield.checkDirty();
    }
});

Template.Wizard.helpers({
	profile: function(){
    let user = Meteor.user();
    return user.profile;
  },
  userId: function(){
    return Meteor.userId();
  },
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
  currentStep: function () {
    return Template.instance().currentStep.get();
  },
  selectedTags: ()=> {

    let userProfile = Meteor.user().profile;
    if(typeof userProfile == 'undefined'){
      return [];
    }
    let tagsArray = userProfile.tags;
    if(typeof tagsArray == 'undefined'){
      tagsArray = [];
      //selectedTags = Tags.find({_id: {$in: tagsArray}});
      //Session.set("selectedTags",selectedTags);
      //return selectedTags;
    }
    return tagsArray;
  },
});

Template.Wizard.events({
  'click .wizard-avatar-preview'(event, template){
    $(".wizard-avatar-preview.selected").removeClass("selected");
    $(event.currentTarget).addClass("selected");

    let image = $(event.currentTarget).css('background-image');
    url = image.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
    console.log(url);
    Template.instance().currentSelection.set(url);
    $('.profile-pic').css("background-image",image);
  },
  'click .step': function(e){
    let nextStep = e.target.dataset.step;
    if(nextStep){
      progressSetStep(e.target.dataset.step);
    }
  },
  'click .wizard-avatar'(event, template){
    Template.instance().currentSelection.set(event.currentTarget.src);
    $('.profile-pic').css("background-image","url("+event.currentTarget.src+")");
  },
  'click #take-photo'(event, template){
    event.preventDefault();
    var cameraOptions = {
            width: 800,
            height: 600
        };
        MeteorCameraUI.getPicture(cameraOptions, function (error, data) {
           if (!error) {
             Session.set("photo", data);
               template.$('.photo').attr('src', data);
           }else{
             console.log(error);
           }
        });
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
  'click #startDate' (event, template){
    $('#startDate')[0].MaterialTextfield.checkDirty();
  },
  'click .wizard-skip' (event, template){
    event.preventDefault();
    confirm("Press a button!");
    FlowRouter.go('/dash/vote');
  },
	'click .wizard-next' (event, template){
		event.preventDefault();
    //$( "#change-photo" ).show();
    currentStep = template.currentStep.get()
    nextStep = currentStep + 1;
    console.log("next - currentStep: " + currentStep + " nextStep: " + nextStep);
    Template.instance().currentStep.set(nextStep);
    progressSetStep(nextStep);
		//template.currentStep.set(moveStep(template.currentStep.get(),1));

	},
  'click .wizard-back' (event, template){
		event.preventDefault();
    currentStep = Template.instance().currentStep.get()
    nextStep = currentStep - 1;
    console.log("back - currentStep: " + currentStep + " nextStep: " + nextStep);
    Template.instance().currentStep.set(nextStep);
    progressSetStep(nextStep);
		//template.currentStep.set(moveStep(template.currentStep.get(),-1));
	},
  'click .wizard-complete' (event, template){
    event.preventDefault();
    var profile = {};
    profile.username = $('#profile-username').val();
    profile.firstName = $('#profile-firstname').val();
    profile.lastName = $('#profile-lastname').val();
    profile.birthday = $('#profile-dob').val();
    profile.photo = $('#profile-image').val();//getProfilePic();//'https://upload.wikimedia.org/wikipedia/commons/b/b4/Brett_king_futurist_speaker_author.jpg';//$('#profile-image').val();
    profile.tagline = $('#profile-tagline').val();
    profile.bio = $('#profile-bio').val();
    profile.tags = getTags();
    profile.motto  = $('#profile-motto').val();
    //profile.skills = {};//$('#profile-skills').val();
    //profile.twitter = $('#profile-twitter').val();
    //profile.google  = $('#profile-google').val();
    //profile.facebook  = $('#profile-facebook').val();
    //profile.linkedin  = $('#profile-linkedin').val();
    //profile.youtube = $('#profile-youtube').val();
    //profile.website = $('#profile-website').val();
    profile.location = $('#profile-location').val();
    profile.social = [
      {
        "type": "twitter",
        "url": $('#profile-twitter').val(),
        "validated": false,
        "visible": $('#twitter-switch').is(":checked"),
      },
      {
        "type": "google",
        "url": $('#profile-google').val(),
        "validated": false,
        "visible": $('#google-switch').is(":checked"),
      },
      {
        "type": "facebook",
        "url": $('#profile-facebook').val(),
        "validated": false,
        "visible": $('#facebook-switch').is(":checked"),
      },
      {
        "type": "linkedin",
        "url": $('#profile-linkedin').val(),
        "validated": false,
        "visible": $('#linkedin-switch').is(":checked"),
      },
      {
        "type": "instagram",
        "url": $('#profile-instagram').val(),
        "validated": false,
        "visible": $('#instagram-switch').is(":checked"),
      },
      {
        "type": "youtube",
        "url": $('#profile-youtube').val(),
        "validated": false,
        "visible": $('#youtube-switch').is(":checked"),
      },
      {
        "type": "website",
        "url": $('#profile-website').val(),
        "validated": false,
        "visible": $('#youtube-website').is(":checked"),
      }
    ];
    profile.skillsDescription = $("#profile-skills-description").val();
    profile.skills = [
      {
        type:"legal",
        description:"",
        selected:$('#checkbox-legal').is(":checked")
      },
      {
        type:"business",
        description:"",
        selected:$('#checkbox-business').is(":checked")
      },
      {
        type:"finance",
        description:"",
        selected:$('#checkbox-finance').is(":checked")
      },
      {
        type:"marketing",
        description:"",
        selected:$('#checkbox-marketing').is(":checked")
      },
      {
        type:"environment",
        description:"",
        selected:$('#checkbox-environment').is(":checked")
      },
      {
        type:"political",
        description:"",
        selected:$('#checkbox-political').is(":checked")
      },
      {
        type:"management",
        description:"",
        selected:$('#checkbox-management').is(":checked")
      },
      {
        type:"administration",
        description:"",
        selected:$('#checkbox-admin').is(":checked")
      },
      {
        type:"design",
        description:"",
        selected:$('#checkbox-design').is(":checked")
      },
      {
        type:"programming",
        description:"",
        selected:$('#checkbox-programming').is(":checked")
      }
    ]
    console.log(profile);
    Meteor.call('updateProfile', profile, function(error) {
      if (error) {
        RavenClient.captureException(error);
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert(TAPi18n.__('pages.profile.alerts.profile-updated'), 'success');
        FlowRouter.go('/compass');
      }
    });

  }
});

/*
** -1 for back, 1 for forwards

function moveStep(currentStep,direction){;
  let nextStep = direction + parseFloat(currentStep);
  let currentStepSelector = '*[data-section="'+currentStep+'"]';
  let nextStepSelector = '*[data-section="'+nextStep+'"]';
  console.log("nextStepSelector: " + nextStepSelector);
  console.log("currentStepSelector: " + currentStepSelector);
  $(".wizard-section").hide();
  $(nextStepSelector).show();
  progressSetStep(nextStep-1);
  return nextStep;
}
*/
/*
Template.Wizard.rendered = function() {
  L.Icon.Default.imagePath = '/packages/bevanhunt_leaflet/images/';

  var map = L.map('wizard-map', {
    doubleClickZoom: false
  //}).setView([49.25044, -123.137], 2);
  }).setView([62.54114431714147, 16.192131042480472], 3);
  L.tileLayer.provider('Esri.WorldGrayCanvas').addTo(map);

  map.on('dblclick', function(event) {
    console.log(event.latlng);
  });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition,showError);
  } else {
    console.log("Geolocation is not supported by this browser.");
  }

  // add clustermarkers
  var markers = L.markerClusterGroup();
  map.addLayer(markers);
  //console.log(markers);

  var query = Markers.find();
  query.observe({
    added: function (document) {
      var marker = L.marker(document.latlng)
        .on('click', function(event) {
          Markers.remove({_id: document._id});
        });
       markers.addLayer(marker);
    },
    removed: function (oldDocument) {
      layers = map._layers;
      var key, val;
      for (key in layers) {
        val = layers[key];
        if (val._latlng) {
          if (val._latlng.lat === oldDocument.latlng.lat && val._latlng.lng === oldDocument.latlng.lng) {
            markers.removeLayer(val);
          }
        }
      }
    }

  });
};
*/

function showError(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      console.log("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      console.log("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      console.log("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      console.log("An unknown error occurred.");
      break;
  }
}

function progressSetStep(stepNum){
  let nextStepSelector = '*[data-section="'+stepNum+'"]';
  $(".wizard-section").hide();
  $(nextStepSelector).show();
  currentStep = stepNum;
  let distance = 100/(steps.length-1);
  let p = (stepNum+1) * distance;
  console.log("steps.length: " + steps.length);
  console.log("currentStep: " + stepNum);
  console.log("nextStepSelector: " + nextStepSelector);
  console.log("distance: " + distance);
  document.getElementsByClassName('percent')[0].style.width = `${p}%`;
  steps.forEach((e) => {
    if (e.id === stepNum) {
      e.classList.add('selected');
      e.classList.remove('completed');
    }
    if (e.id < stepNum) {
      e.classList.add('completed');
    }
    if (e.id > stepNum) {
      e.classList.remove('selected', 'completed');
    }
  });
}

function showPosition(position) {
  let coords = [ position.coords.latitude,position.coords.longitude];
  console.log(coords)
  //var marker = L.marker(coords).addTo(map);
  //map.panTo(new L.LatLng(position.coords.latitude,position.coords.longitude));
  $("#profile-location").val(position.coords.latitude + ", " + position.coords.longitude);
}
