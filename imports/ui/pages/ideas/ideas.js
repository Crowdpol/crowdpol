import "./ideas.html"
import RavenClient from 'raven-js';
Template.Ideas.onCreated(function () {
  var self = this;

  self.autorun(function(){
    console.log("Ideas loaded");
  });
});
/*
Template.Ideas.onRendered(function(){
	self = this;

	this.autorun(function() {


  });
});
*/
Template.Ideas.helpers({

});

Template.Ideas.events({

});
