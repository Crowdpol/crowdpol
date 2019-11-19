export const validFileURL = (fileURL) => {
  if (Meteor.isServer) {
    console.log("validFileURL: " + fileURL);
    if(fileURL){
      /*
        $.get(fileURL)
          .done(function() {
              // Do something now you know the image exists.
            console.log("valid file");
            return true;
          }).fail(function() {
              // Image doesn't exist - do something else.
            console.log("invalid file");
          })
      */
      var http = new XMLHttpRequest();

      http.open('HEAD', fileURL, false);
      http.send();
      console.log(http.status);
      return http.status != 404
    }

  }else{
    console.log("validFileURL: not server");
  }
  return false;
}
