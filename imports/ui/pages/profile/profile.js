import "./profile.html"

Template.Profile.events({
	'click #profile-public-switch' (event, template){
		if(event.target.checked){
			console.log("show public form controls");
		}
	}
});