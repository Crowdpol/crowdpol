import "./profile.html"

Template.Profile.events({
	'click #profile-public-switch' (event, template){
		if(event.target.checked){
			console.log("show public form controls");
		}
	},
	'submit form' (event, template){

		event.preventDefault();
		let profile = {
			name: template.find('[name="profile-username"]').value,
			firstname: template.find('[name="profile-firstname"]').value,
			lastname: template.find('[name="profile-lastname"]').value,
		};
		let updateProfile = {
          firstName: "Test",
          lastName: "User Updates",
          gender: "Other",
          organization: "Test Org Updated",
          website: "http://testuser.com/update",
          bio: "I am a test user, my profile has been updated",
          picture: "/img/default-user-image.png",

    	};
		Meteor.call('updateProfile',Meteor.userId(), updateProfile, function(error){
			if (error){
				Bert.alert(error.reason, 'danger');
			} else {
				template.find('#profile-form').reset();
				Bert.alert('Profile Updated!', 'success');
			}
		});
	}
});