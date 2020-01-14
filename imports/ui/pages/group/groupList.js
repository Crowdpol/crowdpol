import { Groups } from '../../../api/group/Groups.js';
import './groupList.html'
import './addGroup.html'

Template.GroupList.onCreated(function(){
  self = this;
  //Local Storage
  var communityId = LocalStore.get('communityId');
  //Reactive Dictionary
  var dict = new ReactiveDict();
  this.dict = dict;
  dict.set("communityId",LocalStore.get('communityId'));
  dict.set("type",self.data.type);
  //subscriptions
  self.autorun(function() {
    self.subscribe("groups.all");
    //self.subscribe("groups.community", communityId);
  });
});

Template.GroupList.onRendered(function(){

});

Template.GroupList.events({
  'click .group-image-link': function(event, template){
    console.log(event.currentTarget);
  },
  'click .view-group': function(event, template){
    let handle = '/group/' + event.currentTarget.getAttribute("data-handle");
    if(handle){
      FlowRouter.go(handle);
    }

  },
});

Template.GroupList.helpers({
	groups: function(event, template){
    let communityId = Template.instance().dict.get("communityId");
    if(this.type){
      let type = this.type;
      //console.log(type);
      //console.log(Groups.find({"type":type}).count());
      return Groups.find({"type":type,"communityId":communityId});
    }else{
      //console.log("no type man");
    }
    return Groups.find();//{"communityId":communityId}
  },
  alreadyFollowing: function(){
    return true;
  }
});
