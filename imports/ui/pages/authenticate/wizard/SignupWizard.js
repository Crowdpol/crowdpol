import { getTags } from '../../../components/taggle/taggle.js'
import { getProfilePic,showProfileUrl } from '../../../components/profileHeader/profileImage.js'
import { showProfileImageModal,hideProfileImageModal,getSelectedImage } from '../../../components/profileHeader/profileImageModal.js'
import { map,loadMap,addLayer } from '../../../components/maps/leaflet.js'
import { setCoverState } from '../../../components/cover/cover.js'
import RavenClient from 'raven-js';
import './SignupWizard.html';
let steps = [];
//let map;
let canvas;

Template.SignupWizard.onCreated(function(){
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
Template.SignupWizard.onRendered(function(){
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
});
Template.Sunburst.onRendered(function(){
  //let sections = ["culture","finance","defence","education","enterprise","environment","foreign-affairs","social-affairs","infrastructure","justice"];
  console.log("Sunburst rendered");
  var tempArc;
  var arcId = "";
  var startAngle = 0;
  var width = (2*Math.PI)/8;
  var endAngle = width;
  var segementCount = 1;
  let colors = ["#F5E829","#C7D310","#6AB435","#40B8EB","#3F79BD","#30509D","#E94F1D","#F3901D"];
  let sections = ["education","health","environment","infrastructure","law","economy","geopolitics","enterprise"];

  canvas = d3.select("#sunburst svg")
    //.append("svg")
    //.attr("width", 350)
    //.attr("height", 350)

    var curves = canvas.append("g")
      .attr("transform", "translate(175,175)");
    console.log(canvas);
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
        console.log(selector);
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

Template.SignupWizard.helpers({
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

Template.WizardProgressbar.onRendered(function(){
  $('#percent').on('change', function(){
    var val = parseInt($(this).val());
    var $circle = $('.section-svg .circle-bar');

    if (isNaN(val)) {
     val = 100;
    }
    else{
      var r = $circle.attr('r');
      var c = Math.PI*(r*2);

      if (val < 0) { val = 0;}
      if (val > 100) { val = 100;}

      var pct = ((100-val)/100)*c;

      $circle.css({ strokeDashoffset: pct});

      $('#cont').attr('data-pct',val);
    }
  });
});

Template.WizardProgressbar.helpers({
  sections: function(){
    return [
      {
        "id":"progress-section-1",
        "name":"info",
        "title":"Basic Info",
        "steps":6
      },
      {
        "id":"progress-section-2",
        "name":"interests",
        "title":"Interests",
        "steps":10
      },
      {
        "id":"progress-section-3",
        "name":"values",
        "title":"Values",
        "steps":6
      },
      {
        "id":"progress-section-4",
        "name":"community",
        "title":"Community Search",
        "steps":2
      },
      {
        "id":"progress-section-5",
        "name":"summary",
        "title":"Summary",
        "steps":1
      },
    ];
  },
  lastSection: function(index){
    console.log(this);
    console.log(index);
  }
});
