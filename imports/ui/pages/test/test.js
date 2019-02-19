import './test.html';
import './test.scss';

Template.Test.onCreated(function(){
  var wrap = $(".page-content");

  wrap.on("scroll", function(e) {
    console.log("top:" + this.scrollTop)

  });
  addEvent(window, "resize", function(event) {
    console.log('resized');
    var doc = document.documentElement;
    var left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
    var top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
    var w = window.innerWidth;
    var h = window.innerHeight;
    console.log("top: " + top);
    console.log("left: " + left);
    console.log("w: " + w);
    console.log("h: " + h);
    console.log($("#site-wrapper-div").height());
  });

});

Template.Test.onRendered(function(){

});

Template.Test.events({

});
Template.Test.helpers({

});

var addEvent = function(object, type, callback) {
  console.log("addEvent called");
  if (object == null || typeof(object) == 'undefined') return;
  if (object.addEventListener) {
      object.addEventListener(type, callback, false);
  } else if (object.attachEvent) {
      object.attachEvent("on" + type, callback);
  } else {
      object["on"+type] = callback;
  }

};
