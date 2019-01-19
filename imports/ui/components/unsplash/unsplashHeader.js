import './unsplashHeader.html';

Template.UnsplashHeader.onCreated(function() {
  $(".unsplash-search-box").hide();
  Session.set("mouseStart",null);
  Session.set("mouseEnd",null);
  Session.set("amountToMove",null);
  Session.set("coverTop",'0px');
  Session.set("mouseMove",false);
  Session.set("coverPosition","0px 0px");
});

Template.UnsplashHeader.onRendered(function() {
  getCoverPosition();
});

Template.UnsplashHeader.events({
	'click #unsplash-header-button' (event, template){
		event.preventDefault();
    console.log("show/hide unsplash selector");
    $(".unsplash-search-box").toggle();
  },
  'mousedown #cover-image': function(event){
    Session.set("mouseStart",event.clientY);
    console.log('drag starts');
    Session.set("mouseMove",true);
  },
  'mouseup #cover-image': function(event){
    Session.set("mouseEnd",event.clientY);
    console.log('drag stops');
    Session.set("mouseMove",false);
    //let startPosition = Session.get("mouseStart");
    //let amountToMove = event.clientY - startPosition;
    console.log("cover position: " + getCoverPosition());
    Session.set("mouseStart",Session.get("amountToMove"));
    $('#cover-image').css("background-position", getCoverPosition());
  },
  'mousemove #cover-image': function(event){
    console.log("mouse move started");
    let startPosition = Session.get("mouseStart");
    let mouseMove = Session.get("mouseMove");
    if((startPosition != null)&&(mouseMove==true)){
      console.log("startPosition: " + startPosition);
      console.log("event.clientY: " + event.clientY);
      let amountToMove = event.clientY - startPosition;
      Session.set("amountToMove",amountToMove);
      console.log("amountToMove: " + amountToMove);
      let newPosition = "0px " + amountToMove + "px";
      console.log("newPosition: " + newPosition);
      $('#cover-image').css("background-position", newPosition);

    }
  }
});

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
