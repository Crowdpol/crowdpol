import { Communities } from '../../../api/communities/Communities.js'
import './communityDash.html'

Template.CommunityDash.onCreated(function(){
  self = this;
  //Local Storage
  var communityId = LocalStore.get('communityId');
  /*
  //Session variables
  Session.set('variableName','variableValue');
  //Reactive Variables
  self.reactiveVariable = new ReactiveVar([]);
  self.reactiveVariable.set("exampleData");
  //Reactive Dictionary
  */
  var dict = new ReactiveDict();
  this.templateDictionary = dict;
  dict.set("communityId",communityId);
  //subscriptions
  self.autorun(function() {
    self.subscribe("communities.children",LocalStore.get('communityId'));
  });
});

Template.CommunityDash.onRendered(function(){

});

Template.CommunityDash.events({
  'click .community-card-image': function(event, template){
    let id = event.currentTarget.dataset.id;
    if(id){
      console.log("id: " + id);
      LocalStore.set('communityId', id);
    }
    /*
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
    */
  },
});

Template.CommunityDash.helpers({
  currentCommunityName: function(){
    var communityId = LocalStore.get('communityId');
    Communities.find({"_id":communityId});
  },
	childCommunities: function(){
    var communityId = LocalStore.get('communityId');
    return Communities.find({"parentCommunity":communityId});
  },
});
