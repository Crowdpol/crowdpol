import "./profileImage.html"

Template.ProfileImage.onCreated(function() {
	var dict = new ReactiveDict();
	dict.set('change-photo', false);
	this.templateDictionary = dict;
});

Template.ProfileImage.helpers({
  profilePic: function() {
  	return Meteor.user().profile.photo;
  }
});
Template.ProfileImage.events({
	//show image change form
	'click #change-photo-button' (event, template) {
    event.preventDefault();
    var shown = Template.instance().templateDictionary.get('change-photo');
    if(shown){
      $( "#change-photo" ).hide();
    }else{
      $( "#change-photo" ).show();
    }
    Template.instance().templateDictionary.set('change-photo',!shown);
  },
  //hige image change form
  'click #photo-cancel' (event, template) {
  	event.preventDefault();
  	$( "#change-photo" ).hide();
  },

  'keyup #profile-photo-path, paste #profile-photo-path, keydown #profile-photo-path, blur #profile-photo-path' (event, template) {
    var path = $("input#profile-photo-path").val();
    var obj = new Image();
    obj.src = path;

    if (obj.complete) {
        //alert('worked');
        $('img#profile-pic').prop('src', path);
        $("#valid-photo-path").html("");
    } else {
        //alert('doesnt work');
        path = $('[name="profilePhotoPath"]').val();
        $("#valid-photo-path").html("Invalid photo path");
        //$('img#profile-pic').prop('src', path);
    }
  },

  'change #fileInput': function (e, template) {
    //try{
      if (e.currentTarget.files && e.currentTarget.files[0]) {
        // We upload only one file, in case
        // there was multiple files selected
        var file = e.currentTarget.files[0];
          // Only process image files.
        if (!file.type.match('image.*')) {
          $("#valid-photo-path").html("This is not an image");
          return;
        }
        $("#valid-photo-path").html("");
        if (file) {
          var reader = new FileReader();

          reader.onload = function(e) {
            $('img#profile-pic').prop('src', e.target.result);
          }

          reader.readAsDataURL(file);
          /*
          var uploadInstance = Images.insert({
            file: file,
            streams: 'dynamic',
            chunkSize: 'dynamic'
          }, false);
          uploadInstance.on('start', function() {
            template.currentUpload.set(this);
          });

          uploadInstance.on('end', function(error, fileObj) {
            if (error) {
              Bert.alert('Error during upload: ' + error.reason, 'danger');
            } else {
              Bert.alert('File "' + fileObj.name + '" successfully uploaded', 'success');
            }
            template.currentUpload.set(false);
          });

          uploadInstance.start();
          */
          console.log(file);
        }
      }
    //}catch(e){
    //  console.log(e);
     // Bert.alert(e.reason,"danger");
    //}
  },
  
});
/*      if(result.profile.hasOwnProperty("photo")){
        dict.set('photo', result.profile.photo );
      }else{
        dict.set('photo', "/img/default-user-image.png");
      }
*/