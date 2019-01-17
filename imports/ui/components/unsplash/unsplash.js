import './unsplash.html'
import UnsplashSearch from 'unsplash-search';

const accessKey = 'a40bf3876f230abedda23394e4df9111ec3699037213fc002140e3a80693df13';
const provider = new UnsplashSearch(accessKey);
provider.setItemsPerPage(30);
Template.Unsplash.onCreated(function() {
  var self = this;
  Session.set("data",null);
  Session.set("page",1);
  self.autorun(function(){
    provider
      .searchLandscapes('berlin', Session.get("page"))
      .then(data => {
        console.log(data);
        //self.data = new ReactiveVar(data);
        Session.set("data",data);
      })
      .catch(error => error);
  });
});
Template.Unsplash.events({
	'click #search-images-button' (event, template){
		event.preventDefault();
    let searchTerm = $("#search-unsplash").val();
    console.log("searchTerm: " + searchTerm);
    if(searchTerm){
      provider
        .searchLandscapes(searchTerm, Session.get("page"))
        .then(data => {
          console.log(data);
          //self.data = new ReactiveVar(data);
          Session.set("data",data);
        })
        .catch(error => error);
    }
  },
  'click #prev-images-page' (event, template){
    let data = Session.get("data");
    let currentPage = Session.get("page");
    if(currentPage){
      return currentPage;
    }
    return 0;
  },
  'click #next-images-page' (event, template){

  }
});

Template.Unsplash.helpers({
  data: function() {
    console.log(Session.get("data"));
    // Search 'berlin' and get 3rd page
    return "this is data";
  },
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
    console.log(Session.get("data"));
    if(data){
      return data.totalPages;
    }else{
      console.log("data not set");
    }
    return 0;
  },
  totalImages: function(){
    let data = Session.get("data");
    console.log(Session.get("data"));
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
    console.log(provider.getQueryLimit());
    return provider.getQueryLimit();
  },
  remainingQuery: function(){
    console.log(provider.getRemaingQuery());
    return provider.getRemaingQuery();
  }
});

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
