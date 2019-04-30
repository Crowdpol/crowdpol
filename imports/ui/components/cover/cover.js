import './cover.html'
import UnsplashSearch from 'unsplash-search';
//set unsplash constants for cover
const accessKey = 'a40bf3876f230abedda23394e4df9111ec3699037213fc002140e3a80693df13';
const provider = new UnsplashSearch(accessKey);
const defaultURL = 'https://images.unsplash.com/photo-1454166155302-ef4863c27e70?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjUxNTY3fQ&w=1500&dpi=2';
const defaultPosition = 'center';
//set default number of results per page
provider.setItemsPerPage(30);

Template.Cover.onCreated(function() {
  var self = this;
  var dict = new ReactiveDict();
	self.dict = dict;
  self.dict.set("coverEdit",false);
  /* ONLY USE IF POSITION BACKGROUND ENABLED
  self.dict.set("coverTop",0);
  self.dict.set("coverY",0);
  self.dict.set("coverBottom",0);
  self.dict.set("mouseStart",null);
  self.dict.set("mouseEnd",null);
  self.dict.set("amountToMove",null);
  self.dict.set("mouseMove",false);
  self.dict.set("coverPosition","0px 0px");
  self.dict.set("headerYPosition",0);
  */
  //set reactive variables for unsplash search box
  self.dict.set("data",null);
  self.dict.set("page",1);
  self.dict.set("searchTerm","sweden");
  self.autorun(function(){
    updateImages(self);
  });
});

Template.Cover.onRendered(function() {
  var self = this;
  /* ONLY USE IF POSITION BACKGROUND ENABLED
  let element = document.getElementById('cover-image');
  var rect = element.getBoundingClientRect();
  self.dict.set("coverTop",rect.top);
  self.dict.set("coverBottom",rect.bottom);
  getCoverPosition();
  */
  self.autorun(function(){
    //console.log("cover.js self autorun");
    //check if coverURL has been set, else switch to default
    let coverURL = Session.get('coverURL');
    if(typeof coverURL=='undefined'){
      Session.set("coverURL",defaultURL);
    }
    //check if hasCover has been set
    let hasCover = Session.get('hasCover');
    if(typeof hasCover=='undefined'){
      Session.set("hasCover",false);
      Session.set("coverState",'hidden');
    }else{
      //console.log("hasCover defined");
      //console.log("Session.get('coverState'): " + Session.get("coverState"));
    }

    /* ONLY USE IF POSITION BACKGROUND ENABLED
    let coverPosition = Session.get('coverPosition');
    if(typeof coverPosition=='undefined'){
      Session.set("coverPosition",defaultPosition);
    }
    */

    let editState = Template.instance().dict.get("coverEdit");
    if(editState==false){
      $('#cover-image').css("background-image",Session.get('coverURL'));
      $('#cover-image').css("background-position",defaultPosition);//Session.get('coverPosition'));
    }
    //console.log("cover.js self autorun finished,coverState: "+Session.get("coverState"));
    setCoverState(Session.get("coverState"));

    //EXPERIMENT: Cover state is hidden by default, it is the responsibility of the calling page to setCoverState();
  });
});
Template.Cover.events({
  'click #cover-edit-button' (event, template){
		event.preventDefault();
    setCoverState('edit-search');
    Template.instance().dict.set("coverEdit",true);
  },
  'click #cover-close' (event, template){
    console.clear();
    //console.log("#cover-close click event starting");
		event.preventDefault();
    $(".back-button").removeClass('has-header');
    Session.set("hasCover",false);
    Session.set('coverState','edit-hide');
    setCoverState('edit-hide');
    //console.log("setCoverState('edit-hide')");
    Template.instance().dict.set("coverEdit",false);
    //console.log("#cover-close click event finished");
  },
  'click #cover-open' (event, template){
		event.preventDefault();
    let hasCover = Session.get("hasCover");
    if(hasCover){
      Session.set('coverState','edit-hide');
      setCoverState('edit-hide');
    }else{
      Session.set('coverState','edit-show');
      setCoverState('edit-show');
    }
    Session.set("hasCover",!Session.get("hasCover"));
    $(".back-button").addClass('has-header');
  },
  'click #cover-search-close' (event, template){
		event.preventDefault();
    //console.log("#cover-search-close slideUp");
    $(".cover-search-box").slideUp();
    $("#cover-close").show();
    $("#cover-edit-button").show();
    Template.instance().dict.set("coverEdit",false);
  },
  'mouseenter #cover-image': function(event, template){
    let state = Session.get('coverState');
    //console.log("state: " + state);
    if(typeof state!='undefined'){
      if((state=='view-edit')||(state=='edit-show')){
        coverEdit = Template.instance().dict.get("coverEdit");
        //console.log("coverEdit: " + coverEdit);
        if(coverEdit==false){
          $("#cover-image-overlay").show();
        }
      }
    }else{
      //console.log("state undefined");
    }
  },
  'mouseleave #cover-image-overlay': function(event, template){
    $("#cover-image-overlay").hide();
  },
	'click #search-images-button' (event, template){
		event.preventDefault();
    let searchTerm = $("#search-cover").val();
    if(searchTerm){
      Template.instance().dict.set("searchTerm",searchTerm);
      Template.instance().dict.set("page",1);
      updateImages(template);
    }
  },
  'click #prev-images-page' (event, template){
    event.preventDefault();
    let data = Template.instance().dict.get("data");
    let currentPage = Template.instance().dict.get("page");
    if(currentPage > 1){
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
  'click .cover-thumb-image' (event, template){
    let imageURL = "url('"+this.urls.raw + "&w=1500&dpi=2')";
    Session.set("coverURL",imageURL);
    $('#cover-image').css("background-image", imageURL);
    $('#cover-image').css("background-color", this.color);
    $("#header-title").css("color",this.color)
  }
  /* ONLY USE IF POSITION BACKGROUND ENABLED
  'mousedown #cover-image': function(event,template){
    if(!$('#cover-image').hasClass("disable-edit")){
      $('#cover-image').css("cursor", "ns-resize");
      Template.instance().dict.set("mouseStart",event.clientY);
      Template.instance().dict.set("amountToMove",0);
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
      Template.instance().dict.set("coverY",amountToMove);
      Session.set("coverPosition",getCoverPosition());
      Template.instance().dict.set("mouseStart",Session.get("amountToMove"));
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
      $("#cover-image-overlay").show();
    }
  },
  */
});

Template.Cover.helpers({
  getCoverState: function(){
    return Session.get("coverState");
  },
  hasCover: function(){
    if(Session.get("hasCover")){
      return "true";
    }else{
      return "false";
    }
	},
  currentPage: function(template){
    let currentPage = Template.instance().dict.get("page");
    if(currentPage){
      return currentPage;
    }
    return 0;
  },
  totalPages: function(template){
    let data = Template.instance().dict.get("data");
    if(data){
      return data.totalPages;
    }
    return 0;
  },
  totalImages: function(template){
    let data = Template.instance().dict.get("data");
    if(data){
      return data.totalImages;
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
    return provider.getQueryLimit();
  },
  remainingQuery: function(){
    return provider.getRemaingQuery();
  }
  /* ONLY USE IF POSITION BACKGROUND ENABLED
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
  */
});

function updateImages(template){
  provider
    .searchLandscapes(template.dict.get("searchTerm"), template.dict.get("page"))
    .then(data => {
      template.dict.set("data",data);
    })
    .catch(error => error);
}

export function setCoverState(state){
  //console.log("setCoverState called: "+state);
  if(typeof state=='undefined'){
    state = Session.get('coverState');
  }
  switch (state) {
    //cover should be editable and the image should be visible
    case 'edit-show':
      //console.log("edit-show");
      //$(".cover-search-box").hide();
      $('#cover-image').removeClass("disable-edit");
      $("#cover-edit-button").show();
      $("#cover-controls").show();
      $("#cover-image").show();
      $("#cover-close").show();
      $("#cover-open").hide();
      $("#cover-container").slideDown();
      break;
    //cover should be editable, but the image should be hidden
    case 'edit-hide':
      //console.log("edit-hide");
      $("#cover-image").show();
      $("#cover-controls").show();
      $("#cover-close").hide();
      $("#cover-open").show();
      $("#cover-container").hide();
      break;

    //cover should be editable, with search bar expanded
    case 'edit-search':
      //console.log("edit-search");
      $(".cover-search-box").show();
      $("#cover-edit-button").hide();
      $("#cover-close").hide();
      break;

    //cover should be visible but not editable
    case 'view':
      //console.log("view");
      $('#cover-image').addClass("disable-edit");
      $(".cover-search-box").hide();
      $("#cover-image-overlay").hide();
      $("#cover-controls").hide();
      $("#cover-close").hide();
      $("#cover-open").hide();
      $("#cover-container").slideDown();
      break;
    case 'view-edit':
        //console.log("view");
        $('#cover-image').addClass("disable-edit");
        $(".cover-search-box").hide();
        $("#cover-image-overlay").show();
        $("#cover-controls").hide();
        $("#cover-close").hide();
        $("#cover-open").hide();
        $("#cover-container").slideDown();
        break;
    //cover and all control should be completely hidden
    case 'hidden':
      //console.log("hidden");
      $("#cover-controls").hide();
      $("#cover-container").hide();
      break;
    default:
      console.log("setCoverState could not be determined");
  }
}



/* use thisfor fonts that are displayed over header
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
*/

/* ONLY USE IF POSITION BACKGROUND ENABLED
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
  return positions.left + " " + positions.top;
}
*/
