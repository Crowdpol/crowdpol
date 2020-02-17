import "./navigator_content.html";
import {getCurrentCommunity} from '../../../../utils/community.js';
Template.Navigator_Content.onCreated(function(){
  self = this;
  var dict = new ReactiveDict();
  let community = getCurrentCommunity();
  console.log(community);

});
Template.Navigator_Content.onRendered(function(){});
Template.Navigator_Content.events({});
Template.Navigator_Content.helpers({
  community: function(){
    //community = Template.instance().dict.get('community');
    //console.log("community: " + community);
    return getCurrentCommunity();
  },
});
