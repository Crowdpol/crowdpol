import { getTags } from '../../../components/taggle/taggle.js'
import { getProfilePic,showProfileUrl } from '../../../components/profileHeader/profileImage.js'
import { showProfileImageModal,hideProfileImageModal,getSelectedImage } from '../../../components/profileHeader/profileImageModal.js'
import { map,loadMap,addLayer } from '../../../components/maps/leaflet.js'
import { setCoverState } from '../../../components/cover/cover.js'
import RavenClient from 'raven-js';
import './wizard.html';
let steps = [];
//let map;

Template.Wizard.onCreated(function(){
  self = this;
  //Reactive Variables
  self.currentStep = new ReactiveVar(1);

});

Template.Wizard.onRendered(function(){
  //loadMap();
  setCoverState('edit-show');
  $("#leaflet-map").hide();

  //showProfileUrl();
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

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition,showError);
  } else {
    console.log("Geolocation is not supported by this browser.");
  }

  var mdlInputs = document.querySelectorAll('.mdl-js-textfield');
    for (var i = 0, l = mdlInputs.length; i < l; i++) {
      mdlInputs[i].MaterialTextfield.checkDirty();
    }

  var ctx = document.getElementById("myChart").getContext('2d');
  var myChart = new Chart(ctx, {
    type: 'polarArea',
    data: {
      labels: ["M", "T", "W", "T", "F", "S", "S"],
      datasets: [{
        backgroundColor: [
          "#2ecc71",
          "#3498db",
          "#95a5a6",
          "#9b59b6",
          "#f1c40f",
          "#e74c3c",
          "#34495e"
        ],
        data: [12, 19, 3, 17, 28, 24, 7]
      }]
    }
  });
});

Template.Wizard.helpers({
	profile: function(){
    let user = Meteor.user();
    return user.profile;
  },
  profileImageSelection: function(){
    console.log("getSelectedImage(): " + getSelectedImage());
    return Session.get("selectedImage");
  },
  userId: function(){
    return Meteor.userId();
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
  'click .photo-button-class'(event, template){
    event.preventDefault();
    event.stopImmediatePropagation();
    console.log("showModal");
    showProfileImageModal();
  },

  'click .step': function(e){
    let nextStep = e.target.dataset.step;
    if(nextStep){
      progressSetStep(e.target.dataset.step);
    }
  },
  /*
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
  */
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
    //console.log("next - currentStep: " + currentStep + " nextStep: " + nextStep);
    Template.instance().currentStep.set(nextStep);
    progressSetStep(nextStep);
		//template.currentStep.set(moveStep(template.currentStep.get(),1));

	},
  'click .wizard-back' (event, template){
		event.preventDefault();
    currentStep = Template.instance().currentStep.get()
    nextStep = currentStep - 1;
    //console.log("back - currentStep: " + currentStep + " nextStep: " + nextStep);
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
    ];
    interests = [];
    interestCount = $('.compass-button.selected').length;
    interestValue = roundHalf(100/interestCount);
    $( ".compass-button" ).each(function( index ) {
      console.log( index + ": " + $( this ).attr("data-id") );
      interest = {
        "type": $( this ).attr("data-id"),
        "amount":interestValue
      }
      interests.push(interest);
    });
    profile.interests = interests;
    console.log(profile);
    Meteor.call('updateProfile', profile, function(error) {
      if (error) {
        RavenClient.captureException(error);
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert(TAPi18n.__('pages.profile.alerts.profile-updated'), 'success');
        FlowRouter.go('/dash');
      }
    });

  },
  'click .compass-button' (event, template){
    $(event.currentTarget).toggleClass('selected');
  }
});


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
  $( "li.step" ).each(function() {
    $( this ).removeClass("is-active")
  });
  let stepSelector = '.step[data-step="'+stepNum+'"]';
  $(stepSelector).addClass("is-active");
  if(stepNum==4){
    $("#leaflet-map").show("fast", function() {
      map.invalidateSize();
      map.setView([37.000,-120.652], 1);
    });
  }else{
    $("#leaflet-map").hide();
  }
}

function showPosition(position) {
  let coords = [ position.coords.latitude,position.coords.longitude];
  //console.log("showPosition() :" +coords);
  //var marker = L.marker(coords).addTo(map);
  //map.panTo(new L.LatLng(position.coords.latitude,position.coords.longitude));
  $("#profile-location").val(position.coords.latitude + ", " + position.coords.longitude);
  var marker1 = L.marker(coords, {
    title: "marker_1"
  }).addTo(map)
  map.panTo(new L.LatLng(position.coords.latitude, position.coords.longitude));
  //map.setView(coords,5);
  //map.panTo(coords);
}

function roundHalf(num) {
  return Math.round(num*2)/2;
}
