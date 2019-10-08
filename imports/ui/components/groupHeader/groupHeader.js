import './groupHeader.html';
import "./groupImage.js"
import { getUserHasCover, getUserProfilePhoto } from '../../../utils/users';
import { setCoverState } from '../cover/cover.js'

Template.GroupHeader.onCreated(function(){
  $(".mdl-layout").on('scroll', detectScroll);
  Session.set('photoURL', "/img/default-user-image.png");
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

Template.GroupHeader.helpers({
  //START HERE: THIS HAS TO GO SOMEWHERE ELSE
  setHeader: function(userId,editable) {
    //check if userId has been passed through
    if(userId){
      //check if user has cover, if true: URL will be returned, else false returned
      let coverURL = getUserHasCover(userId);
      //if coverURL returned is not false
      if(coverURL){
        //set appropriate sessions variables
        Session.set("hasCover",true);
        Session.set("coverURL",coverURL);
        //check if cover should be editable or readonly
        if(editable==true){
          //console.log("groupHeader.js - is this the problem?");
          Session.set('coverState','edit-show');
        }else{
          Session.set('coverState','view');
        }
      }else{
        //no cover returned, set appropriate sessions variables
        Session.set("hasCover",false);
        //check if cover should be editable or readonly
        if(editable==true){
          Session.set('coverState','edit-hide');
        }else{
          Session.set('coverState','hidden');
        }

      }
      //get current user photo, if none set, default profilephoto image returned
      let photoURL = getUserProfilePhoto(userId);
      Session.set('photoURL',photoURL);
    }else{
      //no user id could be detected, do not display cover
      Session.set("hasCover",false);
    }
    return true;//Session.get("hasCover");
  },
  hasCover: function(){
    //check if user has cover, if not collapse the cover and center the profile image
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
        console.log('ad just passed.');
    }
}
