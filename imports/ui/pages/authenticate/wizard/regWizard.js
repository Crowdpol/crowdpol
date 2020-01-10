import { getTags } from '../../../components/taggle/taggle.js'
import { getProfilePic,showProfileUrl } from '../../../components/profileHeader/profileImage.js'
import { showProfileImageModal,hideProfileImageModal,getSelectedImage } from '../../../components/profileHeader/profileImageModal.js'
import { map,loadMap,addLayer } from '../../../components/maps/leaflet.js'
import { setCoverState } from '../../../components/cover/cover.js'
import RavenClient from 'raven-js';
import './regWizard.html';
let steps = [];
//let map;
let canvas;
Template.RegistrationWizard.onCreated(function(){
  self = this;
  //Reactive Variables
  self.currentStep = new ReactiveVar(1);

});

Template.Sunburst.onRendered(function(){
  //let sections = ["culture","finance","defence","education","enterprise","environment","foreign-affairs","social-affairs","infrastructure","justice"];

  var tempArc;
  var arcId = "";
  var startAngle = 0;
  var width = (2*Math.PI)/8;
  var endAngle = width;
  var segementCount = 1;
    let colors = ["#F5E829","#C7D310","#6AB435","#40B8EB","#3F79BD","#30509D","#E94F1D","#F3901D"];
    let sections = ["education","health","environment","infrastructure","law","economy","geopolitics","enterprise"];
    canvas = d3.select("#sunburst")
      .append("svg")
      .attr("width", 350)
      .attr("height", 350)
    var curves = canvas.append("g")
      .attr("transform", "translate(175,175)");

    curves.selectAll("path")
      .data(sections)
      .enter().append("path")
      .each(arcFunction);

    function arcFunction(d, i) {
      var start = 10;
      var end = 20;
        for (j = 0; j < 10; j++) {
          tempArc = d3.svg.arc()
            .innerRadius(start)
            .outerRadius(end)
            .startAngle(startAngle)
            .endAngle(endAngle)
            .padAngle(.05)
            .padRadius(120)
            .cornerRadius(5);

          //arcId = "arc" + j;
          curves.append("path")
            .attr("class", d)
            //.attr("class", "arc")
            .attr("data-id",j)
            .style("fill", colors[i])
            .attr("d", tempArc);

          start = start + 15;
          end = end + 15;
        }
        startAngle = endAngle;
        endAngle = endAngle + width;

    }
});

Template.RegistrationWizard.helpers({
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

Template.Sunburst.events({
  'change #sunburst-range': function(e,t) {
    console.log(e.target.value);
    let rangeVal = e.target.value;
    d3.selectAll("path.education").style("opacity", 0.25);
    d3.selectAll("path.education").filter(function(d) {
      let val = $(this).data('id');
      return val <= rangeVal
    }).style("opacity", 1.0);
      //.style("opacity")
    /*
    for (x = 1; x <= e.target.value; x++) {
      let arcId = "path#arc0-" + x;
      console.log(arcId);
      //$(arcId).addClass("arc-green");
      d3.select("#path#arc0-1").style("color", "green");
    }
    */
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
