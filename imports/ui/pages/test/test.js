import './test.html';
import './test.scss';

Template.Test.onCreated(function(){

});

Template.Test.onRendered(function(){

});

Template.Test.events({
  "click .closebtn"  (event, template) {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("profile-main").style.marginLeft= "0";
  },
  "click .openbtn" (event, template) {
    document.getElementById("mySidebar").style.width = "250px";
    document.getElementById("profile-main").style.marginLeft = "250px";
  },
});
Template.Test.helpers({

});
