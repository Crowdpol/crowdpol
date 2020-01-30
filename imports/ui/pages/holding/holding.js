import './holding.html'

Template.Holding.onCreated(function(){

});

Template.Holding.onRendered(function(){

});

Template.Holding.events({
  'click .holding-signin': function(event, template){
    event.preventDefault();
    let password = $(".holding-password").val();
    if(password=="bulletproof"){
      console.log("verified");
      Session.set("verified",true);
      //window.location.reload(false);
    }else{
      Bert.alert("Incorrect password. Your IP and Mac Address will be logged after three failed attempts.","danger");
      //alert()
    }
  },
});

Template.Holding.helpers({

});
