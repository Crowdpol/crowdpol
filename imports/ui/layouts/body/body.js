import './body.html';
import '../header/header.js'
import '../drawer/drawer.js'
import '../footer/footer.js'

Template.App_body.onCreated(function() {
  //$('.mdl-layout').MaterialLayout.toggleDrawer();
  //showDrawer = Meteor.user()
  var user = Meteor.user();
  if (user){
  	showDrawer = true;
  } else {
  	showDrawer = false;
  }
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
   }
   else{
      $('.mdl-layout__drawer-right').addClass('active'); 
   }
  });
})