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
      Session.set('bulletproof',true)
      //FlowRouter.go("/login");
    }else{
      Bert.alert("Incorrect password. Your IP and Mac Address will be logged after three failed attempts.","danger");
      //alert()
    }
  },
});

Template.Holding.helpers({
  userVerified: function(){
		return Session.get('bulletproof');
	},
});
