import './cover.html'
import UnsplashSearch from 'unsplash-search';

const accessKey = 'a40bf3876f230abedda23394e4df9111ec3699037213fc002140e3a80693df13';
const provider = new UnsplashSearch(accessKey);
const defaultURL = 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjUxNTY3fQ&w=1500&dpi=2';
const defaultPosition = '0px 0px';

provider.setItemsPerPage(30);
Template.Unsplash.onCreated(function() {
  var self = this;
  var dict = new ReactiveDict();
	self.dict = dict;
  self.dict.set("coverEdit",false);
  self.dict.set("coverTop",0);
  self.dict.set("coverY",0);
  self.dict.set("coverBottom",0);
  self.dict.set("mouseStart",null);
  self.dict.set("mouseEnd",null);
  self.dict.set("amountToMove",null);
  self.dict.set("mouseMove",false);
  //self.dict.set("coverPosition","0px 0px");
  self.dict.set("data",null);
  self.dict.set("page",1);
  self.dict.set("headerYPosition",0);
  self.dict.set("searchTerm","berlin");
  self.autorun(function(){
    updateImages(self);
  });
});

Template.Unsplash.onRendered(function() {
  var self = this;
  let element = document.getElementById('cover-image');
  var rect = element.getBoundingClientRect();
  self.dict.set("coverTop",rect.top);
  self.dict.set("coverBottom",rect.bottom);
  getCoverPosition();
  self.autorun(function(){
    //console.log("unplash onrendered complete");
    let coverURL = Session.get('coverURL');
    let coverPosition = Session.get('coverPosition');
    if(typeof coverURL=='undefined'){
      Session.set("coverURL",defaultURL);
    }
    if(typeof coverPosition=='undefined'){
      Session.set("coverPosition",defaultPosition);
    }
    let editState = Template.instance().dict.get("coverEdit");
    //console.log(editState);
    if(editState==false){
      //console.log("onredered updating background: " + Session.get('coverPosition'));
      $('#cover-image').css("background-image",Session.get('coverURL'));
      $('#cover-image').css("background-position",Session.get('coverPosition'));
      setUnsplashState();
    }else{
      //console.log("onrendered not updating background");
    }

    //console.log(Session.get("hasCover"));
    /*
    if(Session.get("hasCover")){
      setUnsplashState('edit-show');
    }else{
      setUnsplashState('edit-hide');
    }*/
    //console.log("setUnsplashState() -> onRendered");

  });
});
Template.Unsplash.events({
  'click #cover-edit-button' (event, template){
		event.preventDefault();
    //console.log("show/hide unsplash selector");
    //console.log("setUnsplashState('edit-search') -> click #cover-edit-button");
    $(".unsplash-search-box").slideDown();
    //$("#cover-edit-button").hide();
    $("#unsplash-close").hide();
    //setUnsplashState('edit-search');
    $("#cover-image-overlay").hide();
    Template.instance().dict.set("coverEdit",true);
  },
  'click #unsplash-close' (event, template){
		event.preventDefault();
    /*
    let hasCover = Session.get("hasCover");
    if(hasCover){
      console.log('set to edit-hide');
      console.log("setUnsplashState('edit-hide') -> click #unsplash-close");
      setUnsplashState('edit-hide');
    }else{
      console.log('set to edit-show');
      console.log("setUnsplashState('edit-show') -> click #unsplash-close");
      setUnsplashState('edit-show');
    }*/
    $(".back-button").removeClass('has-header');
    setUnsplashState('edit-hide');
    Session.set("hasCover",!Session.get("hasCover"));
    Template.instance().dict.set("coverEdit",false);
  },
  'click #unsplash-open' (event, template){
    //console.log("unsplash open");
		event.preventDefault();
    let hasCover = Session.get("hasCover");
    if(hasCover){
      //console.log('set to edit-hide');
      setUnsplashState('edit-hide');
      //console.log("setUnsplashState('edit-hide') -> click #unsplash-open");
    }else{
      //console.log('set to edit-show');
      setUnsplashState('edit-show');
      //console.log("setUnsplashState('edit-open') -> click #unsplash-open");
    }
    Session.set("hasCover",!Session.get("hasCover"));
    $(".back-button").addClass('has-header');
  },
  'click #unsplash-search-close' (event, template){
		event.preventDefault();
    $(".unsplash-search-box").slideUp();
    //$("#cover-edit-button").show();
    $("#unsplash-close").show();
    Template.instance().dict.set("coverEdit",false);
    console.log(Template.instance().dict.get("coverEdit"));
  },
  'mousedown #cover-image': function(event,template){
    if(!$('#cover-image').hasClass("disable-edit")){
      $('#cover-image').css("cursor", "ns-resize");
      Template.instance().dict.set("mouseStart",event.clientY);
      Template.instance().dict.set("amountToMove",0);
      //console.log('drag starts - event.clientY: ' + event.clientY + " ");
      Template.instance().dict.set("mouseMove",true);
    }
  },
  'mouseup #cover-image': function(event,template){
    if(!$('#cover-image').hasClass("disable-edit")){
      $('#cover-image').css("cursor","default");
      Template.instance().dict.set("mouseEnd",event.clientY);
      Template.instance().dict.set("mouseMove",false);
      let startPosition = Template.instance().dict.get("mouseStart");
      let amountToMove = event.clientY - startPosition;
      //console.log("drag stops - amountToMove: " + amountToMove);
      Template.instance().dict.set("coverY",amountToMove);
      Session.set("coverPosition",getCoverPosition());
      //let startPosition = Session.get("mouseStart");
      //let amountToMove = event.clientY - startPosition;
      //console.log("cover position: " + getCoverPosition());
      Template.instance().dict.set("mouseStart",Session.get("amountToMove"));
      //$('#cover-image').css("background-position", getCoverPosition());
    }
  },
  'mousemove #cover-image': function(event, template){
    if(!$('#cover-image').hasClass("disable-edit")){
      $("#mouseX").html(event.clientX);
      $("#mouseY").html(event.clientY);
      //limit response to movements over the cover
      if((event.clientX>Template.instance().dict.get("coverTop"))&&(event.clientY<Template.instance().dict.get("coverBottom"))){
        //set appropriate cursor
        if(!Template.instance().dict.get("mouseMove")){
          $('#cover-image').css("cursor", "pointer");
        }
        //
        let startPosition = Template.instance().dict.get("mouseStart");
        let mouseMove = Template.instance().dict.get("mouseMove");
        //check if mouseMove state is on
        if((startPosition != null)&&(mouseMove==true)){
          let coverY = Template.instance().dict.get("coverY");
          let amountToMove = coverY + (event.clientY - startPosition);
          Template.instance().dict.set("amountToMove",amountToMove);

          let newPosition = "0px " + amountToMove + "px";
          Template.instance().dict.set("coverPosition",newPosition);
          $('#cover-image').css("background-position",newPosition);
        }
      }else{
        $('#cover-image').css("cursor","default");
      }
    }else{
      //$("#cover-image-overlay").show();
    }
  },
  'mouseleave #cover-image-overlay': function(event, template){
    $("#cover-image-overlay").hide();
  },
  'mouseenter #cover-image': function(event, template){
    let state = Session.get('unsplashState');
    if(typeof state!='undefined'){
      if((state=='view-edit')||(state=='edit-show')){
        coverEdit = Template.instance().dict.get("coverEdit");
        if(coverEdit==false){
          $("#cover-image-overlay").show();
        }
      }
    }
  },
	'click #search-images-button' (event, template){
		event.preventDefault();
    let searchTerm = $("#search-unsplash").val();
    if(searchTerm){
      Template.instance().dict.set("searchTerm",searchTerm);
      Template.instance().dict.set("page",1);
      updateImages(template);
    }
  },
  'click #prev-images-page' (event, template){
    event.preventDefault();
    let data = self.dict.get("data");
    let currentPage = self.dict.get("page");
    if(currentPage > 2){
      Template.instance().dict.set("page",(currentPage - 1));
      updateImages(template);
    }
  },
  'click #next-images-page' (event, template){
    event.preventDefault();
    let data = Template.instance().dict.get("data");
    let currentPage = Template.instance().dict.get("page");
    if(data){
      if(currentPage < data.totalPages){
        Template.instance().dict.set("page",(currentPage + 1));
        updateImages(template);
      }
    }
  },
  'click .unsplash-thumb-image' (event, template){
    let imageURL = "url('"+this.urls.raw + "&w=1500&dpi=2')";
    //console.log("clicked on image, set coverURL");
    //console.log('Session.set("coverURL",imageURL) imageURL:' + imageURL);
    Session.set("coverURL",imageURL);
    $('#cover-image').css("background-image", imageURL);
    $('#cover-image').css("background-color", this.color);
    //console.log(invertColor(this.color,true));
    $("#header-title").css("color",this.color)
  }
});

Template.Unsplash.helpers({
  setUnsplashState: function(){
    /*
    $('#cover-image').css("background-image",Session.get('coverURL'));
    $('#cover-image').css("background-position",Session.get('coverPosition'));
    console.log("setUnsplashState() -> helpers");
    setUnsplashState();
    */
  },
  hasCover: function(){
		return Session.get("hasCover");
	},
  coverY: function(template){
    return Template.instance().dict.get("coverY");
  },
  coverTop: function(template){
    return Template.instance().dict.get("coverTop");
  },
  coverBottom: function(template){
    return Template.instance().dict.get("coverBottom");
  },
  mouseStart: function(template){
    return Template.instance().dict.get("mouseStart");
  },
  mouseEnd: function(template){
    return Template.instance().dict.get("mouseEnd");
  },
  amountToMove: function(template){
    return Template.instance().dict.get("amountToMove");
  },
  mouseMove: function(template){
    return Template.instance().dict.get("mouseMove");
  },
  coverPosition: function(template){
    return Template.instance().dict.get("coverPosition");
  },
  currentPage: function(template){
    let currentPage = Template.instance().dict.get("page");
    if(currentPage){
      return currentPage;
    }else{
      //console.log("currentPage not set");
    }
    return 0;
  },
  totalPages: function(template){
    let data = Template.instance().dict.get("data");
    if(data){
      return data.totalPages;
    }else{
      //console.log("data not set");
    }
    return 0;
  },
  totalImages: function(template){
    let data = Template.instance().dict.get("data");
    if(data){
      return data.totalImages;
    }else{
      //console.log("data not set");
    }
    return 0;
  },
  images: function(template){
    let data = Template.instance().dict.get("data");
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

function updateImages(template){
  provider
    .searchLandscapes(template.dict.get("searchTerm"), template.dict.get("page"))
    .then(data => {
      //console.log(data);
      //self.data = new ReactiveVar(data);
      template.dict.set("data",data);
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
  //console.log(positions, positions.left, positions.top, positions.numbers.left, positions.numbers.top, positions.units.left, positions.units.top);
  return positions.left + " " + positions.top;
}
export function setUnsplashState(state){
  //console.log("state: "+state);
  if(typeof state=='undefined'){
    state = Session.get('unsplashState');
  }
  //console.log("state: "+state);
  switch (state) {
    //cover should be editable and the image should be visible
    case 'edit-show':
      //console.log("edit-show");
      //$(".unsplash-search-box").hide();
      $('#cover-image').removeClass("disable-edit");
      //$("#cover-edit-button").show();
      $("#unsplash-controls").show();
      $("#cover-image").show();
      $("#unsplash-close").show();
      $("#unsplash-open").hide();
      $("#cover-container").show();
      break;
    //cover should be editable, but the image should be hidden
    case 'edit-hide':
      //console.log("edit-hide");
      $("#cover-image").show();
      $("#unsplash-controls").show();
      $("#unsplash-close").hide();
      $("#unsplash-open").show();
      $("#cover-container").hide();
      break;
    /*
    //cover should be editable, with search bar expanded
    case 'edit-search':
      console.log("edit-search");
      $(".unsplash-search-box").show();
      $("#cover-edit-button").hide();
      $("#unsplash-close").hide();
      break;
    */
    //cover should be visible but not editable
    case 'view':
      //console.log("view");
      $('#cover-image').addClass("disable-edit");
      $("#cover-container").show();
      $(".unsplash-search-box").hide();
      $("#cover-image-overlay").hide();
      $("#unsplash-controls").hide();
      $("#unsplash-close").hide();
      $("#unsplash-open").hide();
      break;
    case 'view-edit':
        //console.log("view");
        $('#cover-image').addClass("disable-edit");
        $("#cover-container").show();
        $(".unsplash-search-box").hide();
        $("#cover-image-overlay").show();
        $("#unsplash-controls").hide();
        $("#unsplash-close").hide();
        $("#unsplash-open").hide();
        break;
    //cover and all control should be completely hidden
    case 'hidden':
      //console.log("hidden");
      $("#cover-container").hide();
      $("#unsplash-controls").hide();
      break;
    default:
      console.log("setUnsplashState could not be determined");
  }
}
