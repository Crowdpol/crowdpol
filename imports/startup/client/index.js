// Import client startup through a single index entry point
import './routes.js';
import './routes.js';
import RavenClient from 'raven-js';


/* makes FlowRouter wait until roles are initialised
else isInRole always returns false, as per
https://medium.com/@satyavh/using-flow-router-for-authentication-ba7bb2644f42  */
FlowRouter.wait();
Tracker.autorun(function() {
  if (Roles.subscription.ready() && !FlowRouter._initialized) {
    return FlowRouter.initialize();
  }
});

Meteor.startup(function () {
  // Client startup method.
  var subdomain = window.location.host.split('.')[0]
  var rootUrl = 'https://' + subdomain + Meteor.settings.public.domain;
  process.env.ROOT_URL = rootUrl;

  var sentryDSN = Meteor.settings.public.sentryPublicDSN;
  RavenClient.config(sentryDSN).install();
  Bert.defaults = {
      hideDelay: 5000,
      // Accepts: a number in milliseconds.
      style: 'growl-top-right',
      // Accepts: fixed-top, fixed-bottom, growl-top-left,   growl-top-right,
      // growl-bottom-left, growl-bottom-right.
      //type: 'default'
      // Accepts: default, success, info, warning, danger.
  };
  loadCommunityInfo();
});


function loadCommunityInfo() {
  LocalStore.set('rootCommunities',[]);
  //check for crowdpol:
  var hostname = window.location.host;
  var subdomain = window.location.host.split('.')[0];
  //console.log("hostname: " + hostname);
  //console.log("subdomain: "  + subdomain);
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
  //console.log(subdomain);
  if(subdomain){
    //set title to commuinty name
    document.title = subdomain.charAt(0).toUpperCase() + subdomain.slice(1);
    //console.log("subomdain after case: " + subdomain);
    LocalStore.set('subdomain', subdomain);
    // set LocalStorage info
    if (subdomain!=='landing'){

        Meteor.call('getCommunityBySubdomain', subdomain, function(err, result) {
          if (err) {
            Bert.alert(err.reason, 'danger');
          } else {
            //console.log(result);
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
                //console.log(settings.defaultLanguage);
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
}
