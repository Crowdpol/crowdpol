import './unsplash.html'

import UnsplashSearch from 'unsplash-search';

const accessKey = 'a40bf3876f230abedda23394e4df9111ec3699037213fc002140e3a80693df13';
const provider = new UnsplashSearch(accessKey);
provider.setItemsPerPage(30);
Template.Unsplash.onCreated(function() {
  var self = this;
  $(".unsplash-search-box").hide();
  Session.set("coverTop",0);
  Session.set("coverY",0);
  Session.set("coverBottom",0);
  Session.set("mouseStart",null);
  Session.set("mouseEnd",null);
  Session.set("amountToMove",null);
  Session.set("mouseMove",false);
  Session.set("coverPosition","0px 0px");
  Session.set("data",null);
  Session.set("page",1);
  Session.set("searchTerm","berlin");
  self.autorun(function(){
    updateImages();
  });
});
Template.Unsplash.onRendered(function() {
  $(".unsplash-search-box").hide();
  let element = document.getElementById('cover-image');
  var rect = element.getBoundingClientRect();
  Session.set("coverTop",rect.top);
  Session.set("coverBottom",rect.bottom);
  getCoverPosition();
});
Template.Unsplash.events({
  'click #unsplash-header-button' (event, template){
		event.preventDefault();
    console.log("show/hide unsplash selector");
    $(".unsplash-search-box").toggle();
    $("#unsplash-header-button").toggle();
  },
  'click #unsplash-search-box-button' (event, template){
		event.preventDefault();
    console.log("show/hide unsplash selector");
    $(".unsplash-search-box").toggle();
    $("#unsplash-header-button").toggle();
  },
  'mousedown #cover-image': function(event){
    $('#cover-image').css("cursor", "ns-resize");
    Session.set("mouseStart",event.clientY);
    Session.set("amountToMove",0);
    //console.log('drag starts - event.clientY: ' + event.clientY + " ");
    Session.set("mouseMove",true);
  },
  'mouseup #cover-image': function(event){
    $('#cover-image').css("cursor","default");
    Session.set("mouseEnd",event.clientY);
    Session.set("mouseMove",false);
    let startPosition = Session.get("mouseStart");
    let amountToMove = event.clientY - startPosition;
    console.log("drag stops - amountToMove: " + amountToMove);
    Session.set("coverY",amountToMove);
    //let startPosition = Session.get("mouseStart");
    //let amountToMove = event.clientY - startPosition;
    console.log("cover position: " + getCoverPosition());
    Session.set("mouseStart",Session.get("amountToMove"));
    //$('#cover-image').css("background-position", getCoverPosition());
  },
  'mousemove #cover-image': function(event){
    $("#mouseX").html(event.clientX);
    $("#mouseY").html(event.clientY);
    //limit response to movements over the cover
    if((event.clientX>Session.get("coverTop"))&&(event.clientY<Session.get("coverBottom"))){
      //set appropriate cursor
      if(!Session.get("mouseMove")){
        $('#cover-image').css("cursor", "pointer");
      }
      //
      let startPosition = Session.get("mouseStart");
      let mouseMove = Session.get("mouseMove");
      //check if mouseMove state is on
      if((startPosition != null)&&(mouseMove==true)){
        let coverY = Session.get("coverY");
        let amountToMove = coverY + (event.clientY - startPosition);
        Session.set("amountToMove",amountToMove);

        let newPosition = "0px " + amountToMove + "px";
        Session.set("coverPosition",newPosition);
        $('#cover-image').css("background-position",newPosition);
      }
    }else{
      $('#cover-image').css("cursor","default");
    }
  },
	'click #search-images-button' (event, template){
		event.preventDefault();
    let searchTerm = $("#search-unsplash").val();
    if(searchTerm){
      Session.set("searchTerm",searchTerm);
      Session.set("page",1);
      updateImages();
    }
  },
  'click #prev-images-page' (event, template){
    event.preventDefault();
    let data = Session.get("data");
    let currentPage = Session.get("page");
    if(currentPage > 2){
      Session.set("page",(currentPage - 1));
      updateImages();
    }
  },
  'click #next-images-page' (event, template){
    event.preventDefault();
    let data = Session.get("data");
    let currentPage = Session.get("page");
    if(data){
      if(currentPage < data.totalPages){
        Session.set("page",(currentPage + 1));
        updateImages();
      }
    }
  },
  'click .unsplash-thumb-image' (event, template){
    let imageURL = "url('"+this.urls.raw + "&w=1500&dpi=2')";
    console.log(this);
    $('#cover-image').css("background-image", imageURL);
    $('#cover-image').css("background-color", this.color);
    console.log(invertColor(this.color,true));
    $("#header-title").css("color",this.color)
  }
});

Template.Unsplash.helpers({
  coverY: function(){
    return Session.get("coverY");
  },
  coverTop: function(){
    return Session.get("coverTop");
  },
  coverBottom: function(){
    return Session.get("coverBottom");
  },
  mouseStart: function(){
    return Session.get("mouseStart");
  },
  mouseEnd: function(){
    return Session.get("mouseEnd");
  },
  amountToMove: function(){
    return Session.get("amountToMove");
  },
  mouseMove: function(){
    return Session.get("mouseMove");
  },
  coverPosition: function(){
    return Session.get("coverPosition");
  },
  currentPage: function(){
    let currentPage = Session.get("page");
    if(currentPage){
      return currentPage;
    }else{
      console.log("currentPage not set");
    }
    return 0;
  },
  totalPages: function(){
    let data = Session.get("data");
    if(data){
      return data.totalPages;
    }else{
      console.log("data not set");
    }
    return 0;
  },
  totalImages: function(){
    let data = Session.get("data");
    if(data){
      return data.totalImages;
    }else{
      console.log("data not set");
    }
    return 0;
  },
  images: function(){
    let data = Session.get("data");
    if(data != null){
      return data.images;
    }
    return;
  },
  queryLimit: function(){
    //console.log(provider.getQueryLimit());
    return provider.getQueryLimit();
  },
  remainingQuery: function(){
    //console.log(provider.getRemaingQuery());
    return provider.getRemaingQuery();
  }
});

function updateImages(searchTerm){
  provider
    .searchLandscapes(Session.get("searchTerm"), Session.get("page"))
    .then(data => {
      //console.log(data);
      //self.data = new ReactiveVar(data);
      Session.set("data",data);
    })
    .catch(error => error);
}

//use these for fonts that are displayed over header
function invertColor(hex, bw) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    var r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    if (bw) {
        // http://stackoverflow.com/a/3943023/112731
        return (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? '#000000'
            : '#FFFFFF';
    }
    // invert color components
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    // pad each with zeros and return
    return "#" + padZero(r) + padZero(g) + padZero(b);
}
function padZero(str, len) {
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}

//
function getCoverPosition(){
  let coverPosition = document.getElementById('cover-image');
  let _position = window.getComputedStyle(coverPosition,null).backgroundPosition.trim().split(/\s+/);
  let positions = {
    'left' : _position[0],
    'top' : _position[1],
    'numbers' : {
        'left' : parseFloat(_position[0]),
        'top' : parseFloat(_position[1])
    },
    'units' : {
        'left' : _position[0].replace(/\d+/,''),
        'top' : _position[1].replace(/\d+/,'')
    }
  };
  console.log(positions, positions.left, positions.top, positions.numbers.left, positions.numbers.top, positions.units.left, positions.units.top);
  return positions.left + " " + positions.top;
}
