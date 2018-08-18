import "./interests.html";
import { Tags } from '/imports/api/tags/Tags.js';
//import { setupTaggle } from '../../components/taggle/taggle.js'
import { getTags } from '../../components/taggle/taggle.js'
import { addTag } from '../../components/taggle/taggle.js'
import RavenClient from 'raven-js';

Template.Interests.onRendered(function(){
  var self = this;

  var communityId = LocalStore.get('communityId')
  self.autorun(function() {
    Meteor.subscribe('tags.community', communityId);
  });
  Session.set("tagIndex",-1);

  //self.taggle = new ReactiveVar(setupTaggle());

  const handle = Meteor.subscribe('users.current');

  Meteor.call('getUserTags', Meteor.userId(), function(error, result){
    if (error){
      RavenClient.captureException(error);
      Bert.alert(error.reason, 'danger');
    } else {
      var keywords = _.map(result, function(tag){ return tag.keyword; });
      //self.taggle.get().add(keywords);
    }
  });

});

Template.Interests.onCreated(function() {
  var self = this;
  self.type = new ReactiveVar("Waiting for response from server...");
  
  self.autorun(function() {
    self.subscribe('user.current');
    self.subscribe('users.usernames');
  });
  var dict = new ReactiveDict();
  dict.set('tagsCount', 0);

  this.templateDictionary = dict;
});

Template.Interests.helpers({
  tags: ()=> {
    return Tags.find();
  },
  selectedTags: ()=> {
    tagsArray = Meteor.user().profile.tags;
    tags = [];
    for(i=0;i<tagsArray.length;i++){
      tags.push(tagsArray[i].keyword);
    }
    return tags;
  }
});

Template.Interests.events({
	'click #update-tags' (event, template) {
  	event.preventDefault();
  	var communityId = LocalStore.get('communityId');
    Meteor.call('transformTags', getTags(), communityId, function(error, proposalTags){
			if (error){
        RavenClient.captureException(error);
        Bert.alert(error, 'reason');
			} else {
				var oldProfile = Meteor.users.find({_id: Meteor.userId()},{fields: {profile: 1, isPublic:1}}).fetch();
				var profile = {
          tags: proposalTags
        }
				var newProfile = _.extend(oldProfile, profile);
      };

      Meteor.call('updateProfile', profile, function(error) {
        if (error) {
          RavenClient.captureException(error);
          Bert.alert(error.reason, 'danger');
        } else {
          Bert.alert(TAPi18n.__('pages.profile.alerts.profile-updated'), 'success');
        }
      });

    });
  },
  'click .tag-chip' (event, template){
    tagId = event.target.dataset.keyword
    addTag(event.target.dataset.keyword);
  }
});