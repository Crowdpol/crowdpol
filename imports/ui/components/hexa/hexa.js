import './hexa.html'
import { getUserProfilePhoto } from '../../../utils/users';

Template.Hexagram.onCreated(function(){

});

Template.Hexagram.onRendered(function(){

});

Template.Hexagram.events({

});

Template.Hexagram.helpers({
  profilePic: function(userId) {
    return getUserProfilePhoto(userId);
    //console.log(getUserProfilePhoto(userId));
  	//return Meteor.user().profile.photo;
  },
});
