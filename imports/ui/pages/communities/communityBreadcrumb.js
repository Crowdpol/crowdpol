import './communityBreadcrumb.html';
import { loadCommunityMap } from '../../../ui/components/maps/communityMap.js'
import { setCommunity } from '../../../utils/community';
import { Communities } from '../../../api/communities/Communities.js'
import { map } from '../../components/maps/leaflet.js'

Template.CommunityBreadcrumb.onCreated(function(){
  self = this;
  //Local Storage
  var communityId = LocalStore.get('communityId');

  var dict = new ReactiveDict();
  this.templateDictionary = dict;
  dict.set("communityId",communityId);
  //subscriptions
  self.autorun(function() {
    self.subscribe("communities.all");
  });
});

Template.CommunityDash.onRendered(function(){

});

Template.CommunityBreadcrumb.events({
  'click .community-card-image': function(event, template){
    let id = event.currentTarget.dataset.id;
    if(id){
      LocalStore.set('communityId', id);
    }
  },
  'click .community-breadcrumb': function(event, template){
    let id = event.currentTarget.dataset.id;
    if(id){
      //console.log("setting community to: " + id);
      setCommunity(id);
      loadCommunityMap(id);
      map.setView([0, 0], 0);
      //map.invalidateSize();
      /*
      tabcontent = document.getElementsByClassName("community-tab");
      for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
      }
      $("#communities-tab").show();
      $('*[data-tab="communities-tab"]').addClass("active");
      //FlowRouter.go('App.dash');
      */
    }
  }
});

Template.CommunityBreadcrumb.helpers({
  currentCommunity: function(){
    var communityId = LocalStore.get('communityId');
    let community = Communities.findOne({"_id":communityId});
    if(community){
      return community;
    }
  },
	parentCommunities: function(){
    let parents = [];
    let communityId = LocalStore.get('communityId');
    let currentCommunity = Communities.findOne({"_id":communityId});
    if(currentCommunity){
      if(!currentCommunity.isRoot){
        if(typeof currentCommunity.parentCommunity !=='undefined'){
          parentCommunityId = currentCommunity.parentCommunity;
          isRoot = false;
          let newParentCommunityId= null;
          let x =0;
          let parentCommunity = null;
          while(isRoot==false){
            parentCommunity = Communities.findOne({"_id":parentCommunityId});
            if(parentCommunity){
              if(typeof parentCommunity.name!=='undefined'){
                parents.push(parentCommunity);
              }
              if(typeof parentCommunity.isRoot!=='undefined'){
                isRoot = parentCommunity.isRoot;
              }
              if(typeof parentCommunity.parentCommunity!=='undefined'){
                parentCommunityId = parentCommunity.parentCommunity;

              }
            }else{
              ifRoot = true;
            }
            x=x+1;
            if(x==10){
              isRoot = true;
            }
          }
        }
      }
    }
    return parents.reverse();
  },
});
