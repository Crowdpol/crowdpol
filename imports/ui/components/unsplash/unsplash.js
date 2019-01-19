import './unsplashHeader.js';
import './unsplash.html'

import UnsplashSearch from 'unsplash-search';

const accessKey = 'a40bf3876f230abedda23394e4df9111ec3699037213fc002140e3a80693df13';
const provider = new UnsplashSearch(accessKey);
provider.setItemsPerPage(30);
Template.Unsplash.onCreated(function() {
  var self = this;
  Session.set("data",null);
  Session.set("page",1);
  Session.set("searchTerm","berlin");
  self.autorun(function(){
    updateImages();
  });
});
Template.Unsplash.events({
	'click #search-images-button' (event, template){
		event.preventDefault();
    let searchTerm = $("#search-unsplash").val();
    if(searchTerm){
      Session.set("searchTerm",searchTerm);
      Session.set("page",1);
      updateImages();
    }
  },
  'click #prev-images-page' (event, template){
    event.preventDefault();
    let data = Session.get("data");
    let currentPage = Session.get("page");
    if(currentPage > 2){
      Session.set("page",(currentPage - 1));
      updateImages();
    }
  },
  'click #next-images-page' (event, template){
    event.preventDefault();
    let data = Session.get("data");
    let currentPage = Session.get("page");
    if(data){
      if(currentPage < data.totalPages){
        Session.set("page",(currentPage + 1));
        updateImages();
      }
    }
  },
  'click .unsplash-thumb-image' (event, template){
    let imageURL = "url('"+this.urls.raw + "&w=1500&dpi=2')";
    console.log(this);
    $('#cover-image').css("background-image", imageURL);
    $('#cover-image').css("background-color", this.color);
    console.log(invertColor(this.color,true));
    $("#header-title").css("color",this.color)
  }
});

Template.Unsplash.helpers({
  currentPage: function(){
    let currentPage = Session.get("page");
    if(currentPage){
      return currentPage;
    }else{
      console.log("currentPage not set");
    }
    return 0;
  },
  totalPages: function(){
    let data = Session.get("data");
    if(data){
      return data.totalPages;
    }else{
      console.log("data not set");
    }
    return 0;
  },
  totalImages: function(){
    let data = Session.get("data");
    if(data){
      return data.totalImages;
    }else{
      console.log("data not set");
    }
    return 0;
  },
  images: function(){
    let data = Session.get("data");
    if(data != null){
      return data.images;
    }
    return;
  },
  queryLimit: function(){
    //console.log(provider.getQueryLimit());
    return provider.getQueryLimit();
  },
  remainingQuery: function(){
    //console.log(provider.getRemaingQuery());
    return provider.getRemaingQuery();
  }
});

function updateImages(searchTerm){
  provider
    .searchLandscapes(Session.get("searchTerm"), Session.get("page"))
    .then(data => {
      //console.log(data);
      //self.data = new ReactiveVar(data);
      Session.set("data",data);
    })
    .catch(error => error);
}

function invertColor(hex, bw) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    var r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    if (bw) {
        // http://stackoverflow.com/a/3943023/112731
        return (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? '#000000'
            : '#FFFFFF';
    }
    // invert color components
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    // pad each with zeros and return
    return "#" + padZero(r) + padZero(g) + padZero(b);
}

function padZero(str, len) {
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}

/*
import Unsplash, { toJson } from 'unsplash-js';

var UnsplashAPI = require('unsplash-api');

var Unsplash = new UnsplashAPI({
  applicationID: 'a40bf3876f230abedda23394e4df9111ec3699037213fc002140e3a80693df13'
});

Unsplash.get( 'photos', function(err, data, res) {
  console.log(res);
});


const unsplash = new Unsplash({
  applicationId: "{a40bf3876f230abedda23394e4df9111ec3699037213fc002140e3a80693df13}",
  secret: "{61be3f43e0d2fd0876b95f2c4613846b65961a72ca520655bdea1e283d7e3691}",
  callbackUrl: "{urn:ietf:wg:oauth:2.0:oob}"
});

let authenticationUrl = unsplash.auth.getAuthenticationUrl([
  "public",
  "read_user",
  "write_user",
  "read_photos",
  "write_photos",
  "write_likes",
  "read_collections",
  "write_collections"
]);

console.log(userAuthentication(code));
currentUser();
users();
photos();
collections();
stats();

function userAuthentication(code) {
  return unsplash.auth.userAuthentication(code)
    .then(toJson)
    .then(json => json.access_token);
}

function currentUser() {
  console.log("\nCurrent User");

  unsplash.currentUser.profile()
    .then(toJson)
    .then(json => {
      console.log('profile', json);
    });

  unsplash.currentUser.updateProfile({ location: "¯\_(ツ)_/¯" })
    .then(toJson)
    .then(json => {
      console.log('updateProfile', json);
    });
}

function users() {
  console.log("\nUsers")

  unsplash.users.profile('naoufal')
    .then(toJson)
    .then(json => {
      console.log(json);
    });

  unsplash.users.photos("naoufal")
    .then(toJson)
    .then(json => {
      console.log(json);
    });

  unsplash.users.likes("naoufal")
    .then(toJson)
    .then(json => {
      console.log(json);
     });
}

function photos() {
  console.log("\nPhotos");

  unsplash.photos.listPhotos(1, 10)
    .then(toJson)
    .then(json => {
      console.log(json);
    });

  unsplash.photos.searchPhotos("bear", undefined, 1, 1)
    .then(toJson)
    .then(json => {
      console.log(json);
    });

  unsplash.photos.getPhoto("kZ8dyUT0h30")
    .then(toJson)
    .then(json => {
      console.log(json);
    });

  unsplash.photos.getRandomPhoto({ featured: true })
    .then(toJson)
    .then(json => {
      console.log(json.links.html);
    });

  unsplash.photos.likePhoto("kZ8dyUT0h30")
    .then(toJson)
    .then(json => {
      console.log(json);
    });

  unsplash.photos.unlikePhoto("kZ8dyUT0h30")
    .then(toJson)
    .then(json => {
      console.log(json);
    });
}

function categories() {
  console.log("\nCategories");

  unsplash.categories.listCategories()
    .then(toJson)
    .then(json => {
      console.log(json);
    });

  unsplash.categories.category(4)
    .then(toJson)
    .then(json => {
      console.log(json);
    });

  unsplash.categories.categoryPhotos(4, 1, 1)
    .then(toJson)
    .then(json => {
      console.log(json);
    });
}

function collections() {
  console.log("\nCollections");

   unsplash.collections.listCollections(1, 10)
     .then(toJson)
     .then(json => {
       console.log(json);
     });

   unsplash.collections.listCuratedCollections(1, 10)
     .then(toJson)
     .then(json => {
       console.log(json);
     });

   unsplash.collections.getCollection(151165)
     .then(toJson)
     .then(json => {
       console.log(json);
     });

   unsplash.collections.getCuratedCollection(94)
     .then(toJson)
     .then(json => {
       console.log(json);
     });


   unsplash.collections.getCollectionPhotos(151165)
     .then(toJson)
     .then(json => {
       console.log(json);
     });

   unsplash.collections.getCuratedCollectionPhotos(94)
     .then(toJson)
     .then(json => {
       console.log(json);
     });

   unsplash.collections.createCollection("Birds", "Wild birds from 'round the world", true)
     .then(toJson)
     .then(json => {
       console.log(json);
     });

   unsplash.collections.updateCollection(152645, "Wild", "Wild")
     .then(toJson)
     .then(json => {
       console.log(json);
     });

   unsplash.collections.deleteCollection(152645)
     .then(toJson)
     .then(json => {
       console.log(json);
     });

   unsplash.collections.addPhotoToCollection(151165, '-yPg8cusGD8')
     .then(toJson)
     .then(json => {
       console.log(json);
     });

   unsplash.collections.removePhotoFromCollection(151165, '-yPg8cusGD8')
     .then(toJson)
     .then(json => {
       console.log(json);
     });
}

function stats() {
  console.log("\nStats");

   unsplash.stats.total()
    .then(toJson)
    .then(json => {
      console.log(json);
    });
}
*/
