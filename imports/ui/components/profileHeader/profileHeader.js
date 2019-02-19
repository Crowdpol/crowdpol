import './profileHeader.html';
import "./profileImage.js"
//import '../../components/profileHeader/profileHeader.js';

Template.ProfileHeader.onCreated(function(){
  $(".mdl-layout").on('scroll', detectScroll);

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
  profilePic: function() {
  	return Meteor.user().profile.photo;
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
