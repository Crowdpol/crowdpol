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

		Meteor.call('updateProfile',Meteor.userId(), profile, function(error){
			if (error){
				Bert.alert(error.reason, 'danger');
			} else {
				template.find('#profile-form').reset();
				Bert.alert('Profile Updated!', 'success');
			}
		});
	}
});