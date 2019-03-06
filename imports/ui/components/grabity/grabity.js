import "./grabity.html"
import linkPreview from "@nunkisoftware/link-preview";
//https://www.npmjs.com/package/@nunkisoftware/link-preview
//https://stackoverflow.com/questions/43871637/no-access-control-allow-origin-header-is-present-on-the-requested-resource-whe/43881141#43881141
//https://stackoverflow.com/questions/24054691/how-to-create-link-previews-like-in-facebook-linkedin
//https://stackoverflow.com/questions/4646147/is-there-open-source-code-for-making-link-preview-text-and-icons-like-in-face
//http://www.99points.info/2010/07/facebook-like-extracting-url-data-with-jquery-ajax-php/
//https://stackoverflow.com/questions/19377262/regex-for-youtube-url
Template.Grabity.onRendered(function () {
  const proxyurl = "https://cors-anywhere.herokuapp.com/";
  var request = require('request');
  request('https://cors-anywhere.herokuapp.com/http://www.google.com', function (error, response, body) {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log('body:', body); // Print the HTML for the Google homepage.
  });
  linkPreview("https://cors-anywhere.herokuapp.com/https://www.google.com/").then(response => {
            /*  response = {
                    description:"GitHub is where people build software. More than 24 million people use GitHub to discover, fork, and contribute to over 67 million projects.",
                    image:"https://assets-cdn.github.com/images/modules/open_graph/github-logo.png",
                    imageHeight:"1200",
                    imageType:"image/png",
                    imageWidth:"1200",
                    siteName:"GitHub",
                    title:"Build software better, together",
                    url:"http://github.com"
                }
            */
            console.log(response);
    });
});
