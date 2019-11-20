import { Groups } from '../../../api/group/Groups.js';
import './groupList.html'
import './addGroup.html'

Template.GroupList.onCreated(function(){
  self = this;
  //Local Storage
  var communityId = LocalStore.get('communityId');
  //Reactive Dictionary
  var dict = new ReactiveDict();
  this.templateDictionary = dict;
  dict.set("communityId",LocalStore.get('communityId'));
  //subscriptions
  self.autorun(function() {
    self.subscribe("groups.all");
    //self.subscribe("groups.community", communityId);
  });
});

Template.GroupList.onRendered(function(){

});
/*
Template.GroupList.events({
  'click .some-class': function(event, template){
    var communityId = Template.instance().templateDictionary.get( 'communityId' );
    delegateId = this._id;
    var ranks = Session.get('ranked');
    let settings = LocalStore.get('settings');
    let delegateLimit = -1;

    if(typeof settings != 'undefined'){
      //do something
    }
    Meteor.call('someMethod', someParameter, function(error, result){
      if(error) {
        RavenClient.captureException(error);
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert(TAPi18n.__('pages.delegates.alerts.ranking-updated'), 'success');
      }
    });
  },
});
*/
Template.GroupList.helpers({
	groups: function(){
    console.log("groups called");
    return Groups.find({});
  },
  alreadyFollowing: function(){
    return true;
  }
});
