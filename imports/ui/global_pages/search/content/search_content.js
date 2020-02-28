import "./search_content.html";
import {getCurrentCommunity,getChildCommunities} from '../../../../utils/community.js';
Template.Search_Content.onCreated(function(){});
Template.Search_Content.onRendered(function(){});
Template.Search_Content.events({});
Template.Search_Content.helpers({
  community: function(){
    return getCurrentCommunity();
  }
});

Template.Search_Sub_Communities.helpers({
  subCommunitiesCount: function(){
    return getChildCommunities().count();
  },
  subCommunities: function(){
    return getChildCommunities();
  }
});

Template.Search_Compass.events({
  'click .everything-toggle': function(event,template){
    $(event.currentTarget).toggleClass("selected");
  },
  'click .compass-link': function(event, template){
    console.log("compass clicked");
    $(event.currentTarget).toggleClass("selected");
    $(".search-map-compass").slideToggle();
  },
  'click .compass-value': function(event,template){
    $(event.currentTarget).toggleClass("selected mdl-button--icon");
  }
});
