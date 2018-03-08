import './body.html';
import '../header/header.js'
import '../drawer/drawer.js'
import '../footer/footer.js'
import './styles.css'

import { Communities } from '../../../api/communities/Communities.js'

Template.App_body.onCreated(function() {
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
    self.subscribe('communities.subdomain', subdomain, function() {
      var community = Communities.findOne({subdomain: subdomain});
      console.log('we are done, we have the community ' + community.name);
      if (community.subdomain == 'dev') {
        console.log('we are loading the stylesheet');
        import '../../stylesheets/branding_default.scss';
      } else {
        console.log('we are not loading the stylesheet')
      }
    });
  })
});

Template.App_body.helpers({
	showDrawer: function(){
		return showDrawer;
	}
});

Template.App_body.onRendered(function () {
  $('.mdl-layout__obfuscator-right').click(function(){
    console.log("obfuscator");
   if($('.mdl-layout__drawer-right').hasClass('active')){    
      $('.mdl-layout__drawer-right').removeClass('active'); 
      Session.set('drawerId','');
   }
   else{
      $('.mdl-layout__drawer-right').addClass('active'); 
   }
  });
})