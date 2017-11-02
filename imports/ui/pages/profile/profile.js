import "./profile.html"

Template.Profile.onCreated(function(){ 
  console.log("onCreated started:" + Date.now());   
  var dict = new ReactiveDict();


  Meteor.call('getProfile',Meteor.userId(),function(error,result){
    if (error){
      Bert.alert(error.reason, 'danger');
    }else{
      dict.set( 'isPublic', result.isPublic );
      dict.set( 'username', result.profile.username );
      dict.set( 'firstname', result.profile.firstName );
      dict.set( 'lastname', result.profile.lastName );
      dict.set( 'isPublic', result.isPublic );
      if(result.profile.hasOwnProperty("photo")){
        dict.set('photo', result.profile.photo );
      }else{
        dict.set('photo', "/img/default-user-image.png");
      }
    }
  });
  this.templateDictionary = dict;
});

Template.Profile.events({
	'click #profile-public-switch' (event, template){
			Meteor.call('togglePublic',Meteor.userId(),event.target.checked,function(error){
				if (error){
					Bert.alert(error.reason, 'danger');
				} else {
          var msg = TAPi18n.__('profile-msg-private');
          if(event.target.checked){
            msg = TAPi18n.__('profile-msg-public');
          }
					Bert.alert(msg, 'success');
				}
			});
	},
	'submit form' (event, template){

		event.preventDefault();
		let profile = {
			username: template.find('[name="profile-username"]').value,
			firstName: template.find('[name="profile-firstname"]').value,
			lastName: template.find('[name="profile-lastname"]').value,
      photo: template.find('[name="profile-photo-path"]').value
		};
		Meteor.call('updateProfile',Meteor.userId(), profile, function(error){
			if (error){
				Bert.alert(error.reason, 'danger');
			} else {
				//template.find('#profile-form').reset();
				Bert.alert(TAPi18n.__('profile-msg-updated'), 'success');
			}
		});
	}
});

Template.Profile.helpers({

  profilePic: function() {
    return Template.instance().templateDictionary.get( 'photo' );
  },
  firstName: function() {
    return Template.instance().templateDictionary.get( 'firstname' );
  },
  lastName: function() {
    return Template.instance().templateDictionary.get( 'lastname' );
  },
  username: function() {
    return Template.instance().templateDictionary.get( 'username' );
  },
  isPublicChecked: function() {
    var isPublic = Template.instance().templateDictionary.get( 'isPublic' );
    console.log("isPublicChecked: " + isPublic);
    if(isPublic){
    	return "checked";
    }
  },
});

function hasOwnProperty(obj, prop) {
    var proto = obj.__proto__ || obj.constructor.prototype;
    return (prop in obj) &&
        (!(prop in proto) || proto[prop] !== obj[prop]);
}
