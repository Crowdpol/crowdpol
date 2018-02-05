import "./profileUsername.html"

Template.ProfileUsername.events({
	'blur #profile-username' (event, template) {
    Meteor.call('updateUsernameIsUnique', event.currentTarget.value, function(error, result) {
      if (error) {
        console.log(error);
      } else {
        if (result) {
          //$('#submitProfile').removeAttr('disabled', 'disabled');
          //$('form').unbind('submit');
          $("#valid-username").html("&#10003;");
        } else {
          $("#valid-username").text("Username exists");
          //$('#submitProfile').attr('disabled', 'disabled');
          //$('form').bind('submit',function(e){e.preventDefault();});
        }
      }
    });
  },
  'click #show-settings' (event, template) {
  	event.preventDefault();
  	if(Session.get('showSettings')){
  		console.log("hide settings");
  	}else{
  		console.log("show settings");
  	}
  	Session.set('showSettings',!Session.get('showSettings'))
  }
});

Template.ProfileUsername.helpers({
  username: function() {
  	return Meteor.user().profile.username;
  },
  settingsText: function() {
  	if(Session.get('showSettings')){
  		return "Hide";
  	}
  	return "Show";
  }

});