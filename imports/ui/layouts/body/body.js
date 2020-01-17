import './body.html';
import '../header/header.js'
import '../drawer/drawer.js'
import '../footer/footer.js'
import './styles.css'
import '../../../utils/intro.min.js'
import { communitySettings } from '../../../utils/community.js';

import { Communities } from '../../../api/communities/Communities.js'

Template.App_body.onCreated(function() {
  var wrap = $(".page-content");

  wrap.on("scroll", function(e) {
    console.log("top:" + this.scrollTop)
  });
  var self = this;
  //$('.mdl-layout').MaterialLayout.toggleDrawer();
  //showDrawer = Meteor.user()
  var user = Meteor.user();
  if (user){
  	showDrawer = true;
  } else {
  	showDrawer = false;
  }

  // Get subdomain from LocalStore and subscribe to community
  var subdomain = LocalStore.get('subdomain');

  self.autorun(function(){
    if(subdomain!=='landing'){
      let settings = communitySettings();
      try {
        switch (settings.colorScheme) {
          case 'greyscale':
              import '../../stylesheets/color-schemes/greyscale.scss';
              break;
          case 'syntropi':
              import '../../stylesheets/color-schemes/syntropi.scss';
              break;
          default:
              import '../../stylesheets/color-schemes/default.scss';
        }
      } catch(err) {
        import '../../stylesheets/color-schemes/default.scss';
        Bert.alert(TAPi18n.__('layout.body.no-styles'), 'danger');
      }
      /*
      self.subscribe('communities.subdomain', subdomain, function() {
        // Load Styles based on community settings
      var community = Communities.findOne({subdomain: subdomain});
        try {
          switch (community.settings.colorScheme) {
            case 'greyscale':
                import '../../stylesheets/color-schemes/greyscale.scss';
                break;
            case 'syntropi':
                import '../../stylesheets/color-schemes/syntropi.scss';
                break;
            default:
                import '../../stylesheets/color-schemes/default.scss';
          }
        } catch(err) {
          import '../../stylesheets/color-schemes/default.scss';
          Bert.alert(TAPi18n.__('layout.body.no-styles'), 'danger');
        }
      });
      */
    }
  });
});

Template.App_body.helpers({
	showDrawer: function(){
		return showDrawer;
	},
  isLanding: function(){
    //console.log(LocalStore.get('subdomain'));
    return false;
    /*
    let subdomain = LocalStore.get('subdomain');
    if(subdomain=='landing'){
      return true;
    }else{
      return false;
    }
    */

  }
});

Template.App_body.onRendered(function () {

  $('.mdl-layout__obfuscator-right').click(function(){
   if($('.mdl-layout__drawer-right').hasClass('active')){
      $('.mdl-layout__drawer-right').removeClass('active');
      Session.set('drawerId','');
   }
   else{
      $('.mdl-layout__drawer-right').addClass('active');
   }
  });
});

Template.App_body.events({
  'click #status-ribbon' (event, template){
		event.preventDefault();
    console.log("show alpha message");
  }
});
