import { getTags } from '../../../components/taggle/taggle.js'
import { getProfilePic,showProfileUrl } from '../../../components/profileHeader/profileImage.js'
//import { progressSetStep,progressGetStep } from '../../../components/progress/progressBubbles.js'
import Images from '/lib/images.collection.js';
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
  var picker = new Pikaday({ field: document.getElementById('startDate') });
  //console.log(Meteor.settings)
  let els = document.getElementsByClassName('step');

  Array.prototype.forEach.call(els, (e) => {
    steps.push(e);
  });
  setStep = FlowRouter.getParam("step");
  if(setStep){
    this.currentStep = setStep;
    setStep = setStep -1
    els[setStep].classList.add('selected');
  }
  els[0].classList.add('selected');
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
  }
});

Template.Wizard.events({
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
    FlowRouter.go('/dash/vote');
  },
	'click .wizard-next' (event, template){
		event.preventDefault();
    //$( "#change-photo" ).show();
    currentStep = Template.instance().currentStep.get()
    nextStep = currentStep + 1;
    progressSetStep(nextStep);
		//template.currentStep.set(moveStep(template.currentStep.get(),1));

	},
  'click .wizard-back' (event, template){
		event.preventDefault();
    currentStep = Template.instance().currentStep.get()
    nextStep = currentStep - 1;
    progressSetStep(nextStep);
		//template.currentStep.set(moveStep(template.currentStep.get(),-1));
	},
  'click .wizard-complete' (event, template){
    event.preventDefault();
    var profile = {};
    profile.username = $('#profile-username').val();
    profile.firstname = $('#profile-firstname').val();
    profile.lastname = $('#profile-lastname').val();
    profile.dob = $('#profile-dob').val();
    profile.image = getProfilePic();//'https://upload.wikimedia.org/wikipedia/commons/b/b4/Brett_king_futurist_speaker_author.jpg';//$('#profile-image').val();
    profile.tagline = $('#profile-tagline').val();
    profile.presentation = $('#profile-presentation').val();
    profile.tags = getTags();//$('#profile-tags').val();
    profile.skills = {};//$('#profile-skills').val();
    profile.twitter = $('#profile-twitter').val();
    profile.google  = $('#profile-google').val();
    profile.facebook  = $('#profile-facebook').val();
    profile.linkedin  = $('#profile-linkedin').val();
    profile.youtube = $('#profile-youtube').val();
    profile.website = $('#profile-website').val();
    profile.location = $('#profile-location').val();
    console.log(profile);
    FlowRouter.go('/compass');
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
function showPosition(position) {
  console.log(position.coords.latitude + ", " + position.coords.longitude);
}

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
  Template.instance().currentStep.set(currentStep);
  let distance = 100/(steps.length-1);
  let p = stepNum * distance;
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
