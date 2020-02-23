import { getTags } from '../../../components/taggle/taggle.js'
import { getProfilePic,showProfileUrl } from '../../../components/profileHeader/profileImage.js'
import { showProfileImageModal,hideProfileImageModal,getSelectedImage } from '../../../components/profileHeader/profileImageModal.js'
import { map,loadMap,addLayer } from '../../../components/maps/leaflet.js'
import { setCoverState } from '../../../components/cover/cover.js'
import RavenClient from 'raven-js';
import './regWizard.html';
let steps = [];
//let map;
let thisSection = 0;
let thisStep = 0;
var progress;
var colors = { green: '#4DC87F', lightGreen: '#D9F0E3' };
let canvas;
let stepWidth = 0;

Template.RegistrationWizard.onCreated(function(){
  //console.log("RegistrationWizard");
  self = this;
  //Reactive Variables
  self.currentStep = new ReactiveVar(1);
  var communityId = LocalStore.get('communityId');
  var dict = new ReactiveDict();
	self.dict = dict;
  dict.set('communityId',communityId);
  //dict.set('currentHeader','community-proposals');
  Session.set('selectedCommunity','Global');
  Session.set('selectedMap','GLOBAL');
  Session.set('breadcrumbs',['GLOBAL']);
});
//149, 197, 96 // #95c560red
Template.RegistrationWizard.onRendered(function(){

  var width = 960, height = 100, offset = 48;

  width += offset * 2;
  height += offset * 2;
  var dimensions = '' + 0 + ' ' + 0 + ' ' + width + ' ' + height;

  var svg = d3.select('.signup-progress-wrapper').append('svg')
      .attr('id', 'scene', true)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', dimensions)
      .classed('svg-content', true);

  var steps = ['0', '1', '2', '3', '4'];
  stepWidth = (width - offset * 2) / (steps.length - 1),
  currentStep = '0';
  console.log("stepWidth: " + stepWidth);
  var progressBar = svg.append('g')
                .attr('transform', 'translate(' + offset + ',' + offset + ')')
                .style('pointer-events', 'none');

  var progressBackground = progressBar.append('rect')
      .attr('fill', colors.lightGreen)
      .attr('height', 8)
      .attr('width', width - offset * 2)
      .attr('rx', 4)
      .attr('ry', 4);

  progress = progressBar.append('rect')
      .attr('fill', colors.green)
      .attr('height', 8)
      .attr('width', 0)
      .attr('rx', 4)
      .attr('ry', 4);

  progress.transition()
      .duration(1000)
      .attr('width', function(){
          var index = steps.indexOf(currentStep);
          console.log("stepWidth: " +stepWidth);
          return (index + 1) * stepWidth;
      });

  progressBar.selectAll('circle')
    .data(steps)
    .enter()
    .append('circle')
    .attr('id', function(d, i){ return 'step_' + i; })
    .attr('cx', function(d, i){ return i * stepWidth; })
    .attr('cy', 4)
    .attr('r', 20)
    .attr('fill', '#FFFFFF')
    .attr('stroke', colors.lightGreen)
    .attr('stroke-width', 6)

  /*
  progressBar.selectAll('text')
  .data(steps)
  .enter()
  .append('text')
  .attr('id', function(d, i){ return 'label_' + i; })
  .attr('dx', function(d, i){ return i * stepWidth; })
  .attr('dy', 10)
  .attr('text-anchor', 'middle')
  .text(function(d, i) { return i + 1; })
  */

  updateProgressBar("0");

  //self-running demo
  //setInterval(function() { updateProgressBar(Math.floor(Math.random() * (steps.length - 1)).toString()); } , 2500)

  function setupProgressBar(data_){
    console.log("setupProgressBar()");
    console.log(data_)
    var output = [];
    for(var i = 0; i < data_.length; i++){
       output.push(data_[i].id.toString());
     }
    return output;
  }


});

Template.Sunburst.onRendered(function(){
  //let sections = ["culture","finance","defence","education","enterprise","environment","foreign-affairs","social-affairs","infrastructure","justice"];

  $(function(){
  var tempArc;
  var arcId = "";
  var startAngle = 0;
  var width = (2*Math.PI)/8;
  var endAngle = width;
  var segementCount = 1;
    let colors = ["#F5E829","#C7D310","#6AB435","#40B8EB","#3F79BD","#30509D","#E94F1D","#F3901D"];
    let sections = ["education","health","environment","infrastructure","law","economy","geopolitics","enterprise"];

    canvas = d3.selectAll("svg")
      .attr("width", 350)
      .attr("height", 350)

    var curves = canvas.append("g")
      .attr("transform", "translate(175,175)");

    //console.log(canvas);
    curves.selectAll("path")
      .data(sections)
      .enter().append("path")
      .each(arcFunction);

    function arcFunction(d, i) {
      var start = 10;
      var end = 20;
        for (j = 0; j < 10; j++) {
          tempArc = d3.arc()
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
    let selectors = document.getElementsByClassName("sunburst-range");//document.querySelector('.sunburst-range');
    //console.log(selectors);
    //console.log(selectors.length);
    for(var i = 0; i < selectors.length; i += 1){
      //console.log(selectors[i]);
      selectors[i].addEventListener('input', function (e) {
        let segment = e.currentTarget.dataset.segment;
        let rangeVal = e.target.value;
        let selector = "path." + segment;
        //console.log(selector);
        d3.selectAll(selector).style("opacity", 0.25);
        d3.selectAll(selector).filter(function(d) {
          let val = $(this).data('id');
          //console.log("val: " + (val+1) + " rangeVal: " + rangeVal);
          return (val+1) <= rangeVal
        }).style("opacity", 1.0);
        selector = "#"+segment+"-count";
        $(selector).html(e.target.value);
        //console.log(selector);
      });
    }
    /*
    i.addEventListener('input', function (e) {


    }, false);
    */
    $("input[type=range]").mousemove(function (e) {
      var val = ($(this).val() - $(this).attr('min')) / ($(this).attr('max') - $(this).attr('min'));
      var percent = val * 100;
      $(this).css('background-image',
          '-webkit-gradient(linear, left top, right top, ' +
          'color-stop(' + percent + '%, #50c22e), ' +
          'color-stop(' + percent + '%, #ccc)' +
          ')');

      $(this).css('background-image',
          '-moz-linear-gradient(left center, #50c22e 0%, #50c22e ' + percent + '%, #ccc ' + percent + '%, #ccc 100%)');
    });
  });
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

Template.RegistrationWizard.events({
  'click .next-step': function(event,template){
    console.log("next step");
    let currentStep = $(event.currentTarget).parents('.section-step');
    console.log(currentStep);
    currentStep.toggleClass("active");
    console.log(currentStep.next());
    currentStep.next().toggleClass("active");
    thisStep = thisStep + 1;
  },
  'click .prev-step': function(event,template){
    console.log("previous step");
    let currentStep = $(event.currentTarget).parents('.section-step');
    console.log(currentStep);
    currentStep.toggleClass("active");
    console.log(currentStep.prev());
    currentStep.prev().toggleClass("active");
    thisStep = thisStep - 1;
  },
  'click .next-section': function(event,template){
    console.log("next section");
    console.log($(event.currentTarget).closest(".section-wrapper"));
    let currentSection = $(event.currentTarget).parents('.section-wrapper');
    console.log(currentSection);
    currentSection.toggleClass("active");
    console.log(currentSection.next());
    currentSection.next().toggleClass("active");
    thisSection = thisSection + 1;
    updateProgressBar(thisSection);
  },
  'click .prev-section': function(event,template){
    console.log("prev section");
    console.log($(event.currentTarget).closest(".section-wrapper"));
    let currentSection = $(event.currentTarget).parents('.section-wrapper');
    console.log(currentSection);
    currentSection.toggleClass("active");
    console.log(currentSection.prev());
    currentSection.prev().toggleClass("active");
    thisSection = thisSection - 1;
    updateProgressBar(thisSection);
  },
  'click .signup-complete': function(event,template){
    console.log("go to nav");
    FlowRouter.go("/navigator");
  },
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

function updateProgressBar(step_){
  console.log("updateProgressBar()");
    progress.transition()
        .duration(1000)
        .attr('fill', colors.green)
        .attr('width', function(){
            var index = steps.indexOf(step_);
            console.log("index: " +  index); 
            console.log("stepWidth: " + stepWidth);
            let newWidth = (index) * stepWidth;
            if(newWidth > 0){
              console.log("newWidth greater than 0");
              return (index) * stepWidth;
            }
            console.log("newWidth is negative");
            return 0;
        });

  for(var i = 0; i < steps.length; i++){
    if(i <= steps.indexOf(step_)) {
      d3.select('#step_' + i).attr('fill', colors.green).attr('stroke', colors.green);
      d3.select('#label_' + i).attr('fill', '#FFFFFF');
    } else {
      d3.select('#step_' + i).attr('fill', '#FFFFFF').attr('stroke', colors.lightGreen);
      d3.select('#label_' + i).attr('fill', '#000000');
    }
  }
}
