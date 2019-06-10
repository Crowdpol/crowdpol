import './userCard.html'
import {titleCase} from '../../../utils/functions';
import { userHasCover,userfullname,username,userProfilePhoto } from '../../../utils/users';

Template.UserCard.onCreated(function(){
  /*
  self = this;
  //Local Storage
  var communityId = LocalStore.get('communityId');
  //Session variables
  Session.set('variableName','variableValue');
  //Reactive Variables
  self.reactiveVariable = new ReactiveVar([]);
  self.reactiveVariable.set("exampleData");
  //Reactive Dictionary
  var dict = new ReactiveDict();
  this.templateDictionary = dict;
  dict.set("communityId",LocalStore.get('communityId'));
  //subscriptions
  self.autorun(function() {
    self.subscribe('users.community',communityId);
  });
  */
});

Template.UserCard.onRendered(function(){

});


Template.UserCard.helpers({
  isDate: function(style){
    if(style=='date'){
      return true;
    }
    return false;
  },
  isDateTime: function(style){
    if(style=='date-time'){
      return true;
    }
    return false;
  },
  formatDate: function(date){
    if(date){
      return moment(date).format('MMMM Do YYYY');
    }
    return moment().format('MMMM Do YYYY');
  },
  formatDateTime: function(date){
    if(date){
      return moment(date).format('MMMM Do YYYY, h:mm:ss a');
    }
    return moment().format('MMMM Do YYYY, h:mm:ss a');
  },
  isFlat: function(style){
    if(style=='flat'){
      return true;
    }
    return false;
  },
  isCard: function(style){
    if(style=='card'){
      return true;
    }
    return false;
  },
  isText: function(style){
    if(style=='text'){
      return true;
    }
    return false;
  },
  userPhoto: function(userId){
    //console.log("userPhoto userid: " + userId);
    return userProfilePhoto(userId);
  },
  userFullname: function(userId){
    return titleCase(userfullname(userId));
  },
  username: function(userId){
    return "@" + username(userId);
  },
  hasCover: function(userId){
    let coverURL = userHasCover(userId);
    if(coverURL){
      return "has-cover";
    }
  },
  coverURL: function(userId){
    let coverURL = userHasCover(userId);
    if(coverURL){
      return userHasCover(userId);
    }

  },
  alreadyFollowing: function(userId){
    return Meteor.users.find({_id: Meteor.userId(), "profile.following":userId}).count()
  },
  notMe: function(userId){
    if(userId!=Meteor.userId()){
      return true;
    }
    return false;
  }
});

Template.UserCard.events({
  'click #follow-user': function(event,template){
    followId = event.target.dataset.id;
    if(followId!=Meteor.userId()){
      Meteor.call('addFollower', Meteor.userId(),followId, function(error, postId){
    		if (error){
    			RavenClient.captureException(error);
    			Bert.alert(error.reason, 'danger');
    			return false;
    		} else {
    			 Bert.alert(TAPi18n.__('pages.feed.following'), 'success');
    		}
    	});
    }
  },
  'click #unfollow-user': function(event,template){
    followId = event.target.dataset.id;
    if(followId!=Meteor.userId()){
      Meteor.call('removeFollower',Meteor.userId(),followId, function(error, postId){
    		if (error){
    			RavenClient.captureException(error);
    			Bert.alert(error.reason, 'danger');
    			return false;
    		} else {
    			 Bert.alert(TAPi18n.__('pages.feed.unfollow'), 'success');
    		}
    	});
    }
  },
});
