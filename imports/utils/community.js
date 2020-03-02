import { Communities } from '../api/communities/Communities.js'
import { _ } from 'meteor/underscore';

if (Meteor.isServer) {

  export const communitySettings = (id) => {
    if(!id){
      id = LocalStore.get('communityId');
      //console.log("setting community id to :"+id);
    }
    let community = Communities.findOne({"_id":id});
    if(community){
      if(typeof community.settings!=='undefined'){
        //console.log(community.settings);
        return community.settings;
      }
    }
    return false;
  };

  export const getCommunityBySubomdain = (subdomain) => {
    if(!subdomain){
      subdomain = getSubdomain();
    }
    let community = Communities.findOne({"subdomain":subdomain});
    if(community){
      //console.log("community");
      //console.log(community);
      return community;
    }
    return false;
  }

  export const getCommunityById = (communityId) => {
    if(!communityId){
      console.log("getCommunityById: communityId not set.");
      communityId = getCommunity();
    }
    let community = Communities.findOne({"_id":communityId});
    //console.log(community);
    if(community){
      //console.log(community);
      return Communities.findOne({"_id":communityId});
    }else{
      console.log("getCommunityById(): no community found");
    }
  }

  export const setDefaultLanguage = (lang) => {
    if(!lang){
      lang = 'en';
    }
    Session.set("i18n_lang",lang)
    TAPi18n.setLanguage(lang);
    /* TODO: change locale dynamically*/
    moment.locale(lang);
    //console.log("lang is now: " + lang);

    //return false;
  };

  export const setCommunity = (id) => {
    if(id){
      let community = Communities.findOne({"_id":id});
      if(community){
        LocalStore.set('communityId',community._id);
        if(typeof community.settings!=='undefined'){
          let settings = community.settings;
          LocalStore.set('settings',settings);
          console.log("----------");
          console.log(settings);
          console.log("----------");
          if(typeof settings.defaultLanguage!=='undefined'){
            lang = settings.defaultLanguage;
            setDefaultLanguage(lang);
          }
          if(typeof settings.languages!=='undefined'){
            let languages = settings.languages;
            LocalStore.set('languages',languages);
          }else{
            LocalStore.set('languages',['en']);
          }
        }else{
          console.log("no settings found for community");
        }
        return true;
      }else{
        console.log("community not found")
      }
    }else{
      console.log("no id set");
    }
    return false;
  }

  export const setCommunityToRoot = () => {
    let subdomain = getSubdomain();
    console.log("sudbomain: " + subdomain);
    if (subdomain!=='landing'){
        Meteor.call('getRootCommunity', function(err, result) {
          if (err) {
            Bert.alert(err.reason, 'danger');
          } else {
            if(typeof result._id !== 'undefined'){
              LocalStore.set('communityId', result._id);
              //console.log('setting community to : ' + result.name);
              let settings = result.settings;

              //set favicon if community icon is set
              if(typeof settings.faviconUrl != 'undefined'){
                var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
                //link.type = 'image/x-icon';
                link.rel = 'shortcut icon';
                link.href = settings.faviconUrl;
                document.getElementsByTagName('head')[0].appendChild(link);
              }
              if(typeof settings.defaultLanguage != 'undefined'){
                console.log(settings.defaultLanguage);
                moment.locale(settings.defaultLanguage);
              }
            }
          }
        });
    } else {
      //Bert.alert(TAPi18n.__('pages.routes.alerts.no-subdomain'), 'danger');
      console.log(TAPi18n.__('pages.routes.alerts.no-subdomain'));
    }

  }

  export const getCommunity = () => {
    let id = LocalStore.get('communityId');
    if(id){
      return id;
    }else{
      console.log("getCommunity(): could not determine community id.");
    }
    return false;
  }

  export const getCurrentCommunity = (communityId) => {
    //console.log("getCurrentCommunity() called");
    if(!communityId){
      //console.log("getCurrentCommunity(): communityId not set, use LocalStore.get('communityId'): " + LocalStore.get('communityId'));
      communityId = getCommunity();
    }

    if(communityId){
      return getCommunityById(communityId);
    }
    return false;
  }

  export const getChildCommunities = (communityId) => {
    if(!communityId){
      console.log("getChildCommunities: communityId not set.");
      communityId = getCommunity();
    }
    if(communityId){
      return Communities.find({"parentCommunity":communityId});
    }
    return false;
  }

  export const getSubdomain = () => {
    //check for crowdpol:
    var hostname = window.location.host;
    var subdomain = window.location.host.split('.')[0];
    console.log("hostname: " + hostname);
    console.log("subdomain: "  + subdomain);
    switch (hostname) {
      case "crowdpol.com":
          subdomain = "landing";
          break;
      case "www.crowdpol.com":
          subdomain = "landing";
          break;
      case "crowdpol.org":
          subdomain = "landing";
          break;
      case "www.crowdpol.org":
          subdomain = "landing";
          break;
      case "commondemocracy.org":
          subdomain = "landing";
          break;
      case "www.commondemocracy.org":
          subdomain = "landing";
          break;
      case "www.syntropi.se":
          subdomain = "landing";
          break;
      case "localhost:3000":
          subdomain = "landing";
          break;
      /*
      default:
          subdomain = "landing";//window.location.host.split('.')[0];
      */
    }
    return subdomain;
  }

  export const loadCommunityInfo = () => {
    let subdomain = getSubdomain();
    if(subdomain){
      //set title to commuinty name
      document.title = subdomain.charAt(0).toUpperCase() + subdomain.slice(1);
      //console.log("subomdain after case: " + subdomain);
      LocalStore.set('subdomain', subdomain);
      // set LocalStorage info
      if (subdomain!=='landing'){
        Meteor.call('getCommunityBySubdomain',subdomain, function(err, result) {
          if (err) {
            Bert.alert(err.reason, 'danger');
          } else {
            if(typeof result._id !== 'undefined'){
              console.log("loadCommunityInfo: ");
              console.log(result);
              LocalStore.set('communityId', result._id);
              //console.log('setting community to : ' + result.name);
              let settings = result.settings;

              //set favicon if community icon is set
              if(typeof settings.faviconUrl != 'undefined'){
                var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
                //link.type = 'image/x-icon';
                link.rel = 'shortcut icon';
                link.href = settings.faviconUrl;
                document.getElementsByTagName('head')[0].appendChild(link);
              }
              if(typeof settings.defaultLanguage != 'undefined'){
                console.log(settings.defaultLanguage);
                moment.locale(settings.defaultLanguage);
              }
            }else{
              console.log("go to community root");
              setCommunityToRoot();
            }
          }
        });
      }else{
        console.log("landing page");
      }
    }else{
      console.log("could not determine subdomain");
    }
  }

}
