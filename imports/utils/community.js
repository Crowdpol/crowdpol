import { Communities } from '../api/communities/Communities.js'
import { _ } from 'meteor/underscore';

export const communitySettings = (id) => {
  if(!id){
    id = LocalStore.get('communityId');
  }
  let community = Communities.findOne({"_id":id});
  if(community){
    if(typeof community.settings!=='undefined'){
      console.log(community.settings);
      return community.settings;
    }
  }
  return false;
};

export const getCommunityBySubomdain = (subdomain) => {
  let community = Communities.findOne({"subdomain":subdomain});
  if(community){
    console.log("community");
    console.log(community);
    return community;
  }
  return false;
}

export const setDefaultLanguage = (lang) => {
  if(lang){
    Session.set("i18n_lang",lang)
    TAPi18n.setLanguage(lang);
    /* TODO: change locale dynamically*/
    moment.locale(lang);
    console.log("lang is now: " + lang);
  }
  return false;
};

export const setCommunity = (id) => {
  if(id){
    let community = Communities.findOne({"_id":id});
    if(community){
      LocalStore.set('communityId',community._id);
      if(typeof community.settings!=='undefined'){
        let settings = community.settings;
        LocalStore.set('settings',settings);
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
  let subdomain = LocalStore.get('subdomain');
  console.log("sudbomain: " + subdomain);
  if (subdomain!=='landing'){
      let community = getCommunityBySubomdain(subdomain);
      console.log("setCommunityToRoot: " + community.name);
      LocalStore.set('communityId',community._id);
      if(typeof community.settings!=='undefined'){
        let settings = community.settings;
        LocalStore.set('settings',settings);
        if(typeof settings.defaultLanguage!=='undefined'){
          lang = settings.defaultLanguage;
          setDefaultLanguage(lang);
        }
      }else{
        console.log("no settings found for community");
      }
      /*
      Meteor.call('getCommunityBySubdomain', subdomain, function(err, result) {
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
      */
  } else {
    //Bert.alert(TAPi18n.__('pages.routes.alerts.no-subdomain'), 'danger');
    console.log(TAPi18n.__('pages.routes.alerts.no-subdomain'));
  }

}
