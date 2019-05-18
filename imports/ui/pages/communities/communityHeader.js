import './communityHeader.html';

import { Communities } from '../../../api/communities/Communities.js'

Template.CommunityHeader.onCreated(function(){
  self = this;
  //Local Storage
  var communityId = LocalStore.get('communityId');

  var dict = new ReactiveDict();
  this.templateDictionary = dict;
  dict.set("communityId",communityId);
  //subscriptions
  self.autorun(function() {
    self.subscribe("communities.all");
    //console.log(Communities.find().count());
  });
});

Template.CommunityDash.onRendered(function(){

});

Template.CommunityHeader.events({
  'click .community-card-image': function(event, template){
    let id = event.currentTarget.dataset.id;
    if(id){
      //console.log("id: " + id);
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

Template.CommunityHeader.helpers({
  currentCommunityName: function(){
    var communityId = LocalStore.get('communityId');
    console.log("communityId: " + communityId);
    let community = Communities.findOne({"_id":communityId});
    if(community){
      console.log("returning currentCommunityName: " + community.name);
      return community.name;
    }else{
      console.log("no community");
    }
  },
	parentCommunities: function(){
    //console.log(Communities.find().count());
    let parents = [];
    let communityId = LocalStore.get('communityId');
    let currentCommunity = Communities.findOne({"_id":communityId});
    if(currentCommunity){
      console.log("selected community: " + currentCommunity.name);
      if(!currentCommunity.isRoot){
        if(typeof currentCommunity.parentCommunity !=='undefined'){
          console.log();
          parentCommunityId = currentCommunity.parentCommunity;
          console.log("parentCommunityId: " + parentCommunityId);
          isRoot = false;
          let newParentCommunityId= null;
          let x =0;
          let parentCommunity = null;
          while(isRoot==false){
            parentCommunity = Communities.findOne({"_id":parentCommunityId});
            console.log(parentCommunity);
            if(parentCommunity){
              if(typeof parentCommunity.name!=='undefined'){
                console.log("parent community: " + parentCommunity.name);
                parents.push(parentCommunity.name);
                console.log(parentCommunity.name + " added");
              }
              if(typeof parentCommunity.isRoot!=='undefined'){
                console.log("parent community isRoot: " + parentCommunity.isRoot);
                isRoot = parentCommunity.isRoot;
              }
              if(typeof parentCommunity.parentCommunity!=='undefined'){
                console.log("changing parentCommunityId from: " + parentCommunityId + " to: " + parentCommunity.parentCommunity);
                parentCommunityId = parentCommunity.parentCommunity;

              }
            }else{
              console.log("could not find parent community");
              ifRoot = true;
            }
            x=x+1;
            if(x==10){
              console.log("counter hit 10, exiting loop");
              isRoot = true;
            }
          }


          /*
          do {
            text += "The number is " + i;
            i++;
          }
          while (i < 10);
          */
        }else{
          console.log("parent undefined");
        }
      }else{
        console.log("communuty is Root");
      }
    }
    console.log(parents);
    return parents.reverse();
  },
});
