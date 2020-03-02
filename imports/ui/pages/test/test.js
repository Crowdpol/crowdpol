import './test.html';
import './test.scss';


Template.Test.onCreated(function(){
  console.log("Test: onCreated()");
});

Template.Test.onRendered(function(){
  console.log("Test: onRendered()");

});

Template.Test.events({
  'click #checkURL'(event,template){
    console.log("check: " + $("#url").val());
    //https://scontent-arn2-2.xx.fbcdn.net/v/t1.0-9/18447187_10154384078002181_368162084903448166_n.jpg?_nc_cat=107&amp;_nc_oc=AQn9CAst_-4-xXL2DgWrunHuaeApjxrPuF2IOOmxs4wvbcIy7m0wSXYEwgEFrhDIPCeHPC636OD8Bovd3nGEqPzn&amp;_nc_ht=scontent-arn2-2.xx&amp;oh=21d3ea37dc23ca52fce5be60272476de&amp;oe=5E39A830
    //http://www.google.com/images/srpr/nav_logo14.png
    var imageUrl = 'https://scontent-arn2-2.xx.fbcdn.net/v/t1.0-9/18447187_10154384078002181_368162084903448166_n.jpg?_nc_cat=107&amp;_nc_oc=AQn9CAst_-4-xXL2DgWrunHuaeApjxrPuF2IOOmxs4wvbcIy7m0wSXYEwgEFrhDIPCeHPC636OD8Bovd3nGEqPzn&amp;_nc_ht=scontent-arn2-2.xx&amp;oh=21d3ea37dc23ca52fce5be60272476de&amp;oe=5E39A830';
    imageExists(imageUrl, function(exists) {
      console.log('RESULT: url=' + imageUrl + ', exists=' + exists);
    });
  }

});

Template.Test.helpers({

});

// The "callback" argument is called with either true or false
// depending on whether the image at "url" exists or not.
function imageExists(url, callback) {
  var img = new Image();
  img.onload = function() { callback(true); };
  img.onerror = function() { callback(false); };
  img.src = url;
}
