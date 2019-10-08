import './userCard.html'
import {titleCase} from '../../../utils/functions';
import { getUserHasCover,getUserfullname,getUsername,getUserProfilePhoto } from '../../../utils/users';
import RavenClient from 'raven-js';

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
    return getUserProfilePhoto(userId);
  },
  userFullname: function(userId){
    let fullname = getUserfullname(userId);
    if(fullname){
      return titleCase(fullname);
    }
    return "Published";
  },
  username: function(userId){
    let username = getUsername(userId)
    if(!username){
      return "Anonymously";
    }
    return "@" + username;
  },
  hasCover: function(userId){
    let coverURL = getUserHasCover(userId);
    if(coverURL){
      return "has-cover";
    }
  },
  coverURL: function(userId){
    let coverURL = getUserHasCover(userId);
    if(coverURL){
      return getUserHasCover(userId);
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
    console.log("followId: " + followId);
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
  'click .view-user': function(event, template){
    event.preventDefault();
    Session.set('drawerId',this.userId);
    if($('.mdl-layout__drawer-right').hasClass('active')){
        $('.mdl-layout__drawer-right').removeClass('active');
     }
     else{
        $('.mdl-layout__drawer-right').addClass('active');
     }

  },
});
