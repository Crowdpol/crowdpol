import "./navigator_content.html";
import {getCurrentCommunity,getChildCommunities} from '../../../../utils/community.js';
Template.Navigator_Content.onCreated(function(){});
Template.Navigator_Content.onRendered(function(){});
Template.Navigator_Content.events({});
Template.Navigator_Content.helpers({
  community: function(){
    return getCurrentCommunity();
  }
});

Template.Navigator_Sub_Communities.helpers({
  subCommunitiesCount: function(){
    return getChildCommunities().count();
  },
  subCommunities: function(){
    return getChildCommunities();
  }
});
