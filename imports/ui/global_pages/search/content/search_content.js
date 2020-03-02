import "./search_content.html";
import {getCurrentCommunity,getChildCommunities} from '../../../../utils/community.js';
Template.Search_Overview_Content.onCreated(function(){});
Template.Search_Overview_Content.onRendered(function(){});
Template.Search_Overview_Content.events({});
Template.Search_Overview_Content.helpers({
  community: function(){
    return getCurrentCommunity();
  }
});

Template.Search_Communities_Content.helpers({
  subCommunitiesCount: function(){
    return getChildCommunities().count();
  },
  subCommunities: function(){
    return getChildCommunities();
  }
});
