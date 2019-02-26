import './profileHeader.html';
import "./profileImage.js"
import { userHasCover } from '../../../utils/users';
import { userProfilePhoto } from '../../../utils/users';

Template.ProfileHeader.onCreated(function(){
  $(".mdl-layout").on('scroll', detectScroll);
  Session.set('photoURL', "/img/default-user-image.png");
  Session.set('coverState','view');
  /*
  var wrap = $(".page-content");
  console.log(wrap);
  wrap.on("scroll", function(e) {
    console.log("top:" + this.scrollTop)
    if (this.scrollTop > 147) {
      wrap.addClass("test-fix-search");
    } else {
      wrap.removeClass("test-fix-search");
    }

  });
  */
});

Template.ProfileHeader.helpers({
  setHeader: function(userId,editable) {
    console.log("setHeader called: " + userId + " editable: " + editable);
    if(editable==true){
      Session.set('coverState','edit-show');
    }
    if(userId){
      let coverURL = userHasCover();
      if(coverURL){
        Session.set("hasCover",true);
        Session.set("coverURL",coverURL);

      }else{
        Session.set("hasCover",false);
      }
      let photoURL = userProfilePhoto(userId);
      console.log("profileHeader.js photoURL: " + photoURL);
      Session.set('photoURL',photoURL);
    }
  },
  hasCover: function(){
    if(Session.get("hasCover")){
      return "column-container ";
    }
    return "collapsed";
  }
});

var detectScroll = function(e){
  console.log("window.onscroll");

    var aTop = $('#profile-header-image').height();
    console.log(aTop);
    if($(this).scrollTop()>=aTop){
        alert('ad just passed.');
    }

}
