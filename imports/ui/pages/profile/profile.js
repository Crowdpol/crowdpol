import "./profile.html"

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
  'click #profile-delegate'(event, template){
      //Step 1: Check if person already is a delegate, if so remove role
      var isDelegate = Roles.userIsInRole(Meteor.user(),'delegate');
      console.log("isDelegate: " + isDelegate);
      if(isDelegate){
        Meteor.call('toggleRole',Meteor.userId(),'delegate',false,function(error){
          if (error){
            Bert.alert(error.reason, 'danger');
          } else {
            var msg = "You are no longer a delegate";
            Bert.alert(msg, 'success');
          }
        }); 
      }else{
        //Step 2: If person not delegate, check profile is complete before submission
          //NOTE: inomplete
        //Step 3: Profile is complete, submit approval request
        Meteor.call('requestApproval',Meteor.userId(),'individual-delegate',function(error){
          if (error){
            Bert.alert(error.reason, 'danger');
          } else {
            var msg = "Request submitted";//TAPi18n.__('profile-msg-private');
            Bert.alert(msg, 'success');
          }
        });  
      }
  },
  'click #profile-candidate'(event, template){
      //Step 1: Check if person already is a candidate, if so remove role
      var isCandidate = Roles.userIsInRole(Meteor.user(),'delegate');
      console.log("isCandidate: " + isCandidate);
      if(isCandidate){
        Meteor.call('toggleRole',Meteor.userId(),'candidate',false,function(error){
          if (error){
            Bert.alert(error.reason, 'danger');
          } else {
            var msg = "You are no longer a candidate";
            Bert.alert(msg, 'success');
          }
        }); 
      }else{
        //Step 2: If person not candidate, check profile is complete before submission
          //NOTE: inomplete
        //Step 3: Profile is complete, submit approval request
        Meteor.call('requestApproval',Meteor.userId(),'candidate',function(error){
          if (error){
            Bert.alert(error.reason, 'danger');
          } else {
            var msg = "Request submitted";//TAPi18n.__('profile-msg-private');
            Bert.alert(msg, 'success');
          }
        });  
      }
  }
});

Template.Profile.events({
  publicStatus: function() {
    return "[Private]";
  },
  delegateStatus: function() {
    return "[Pending]";
  },
  candidateStatus: function() {
    return "[Submitted for Approval]";
  },
});

Template.ProfileIndividual.onCreated(function(){ 
  var self = this;
  self.autorun(function() {
    self.subscribe('user.current');
  });
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
      dict.set( 'bio', result.profile.bio);
      dict.set( 'website', result.profile.website );
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

Template.ProfileIndividual.events({
	'submit form' (event, template){

		event.preventDefault();
		let profile = {
			username: template.find('[name="profile-username"]').value,
			firstName: template.find('[name="profile-firstname"]').value,
			lastName: template.find('[name="profile-lastname"]').value,
      photo: template.find('[name="profile-photo-path"]').value,
      bio: template.find('[name="profile-bio"]').value,
      website: template.find('[name="profile-website"]').value
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

Template.ProfileIndividual.helpers({

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
  bio: function() {
    return Template.instance().templateDictionary.get( 'bio' );
  },
  website: function() {
    return Template.instance().templateDictionary.get( 'website' );
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
