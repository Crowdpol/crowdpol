import './unsplash.html'
import UnsplashSearch from 'unsplash-search';

/*
using the following node libraries:
---------------------------------------------
https://www.npmjs.com/package/unsplash-js
https://www.npmjs.com/package/unsplash-search
*/

const accessKey = 'a40bf3876f230abedda23394e4df9111ec3699037213fc002140e3a80693df13';
const provider = new UnsplashSearch(accessKey);
const defaultURL = 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjUxNTY3fQ&w=1500&dpi=2';
const defaultPosition = '0px 0px';

provider.setItemsPerPage(30);
Template.Unsplash.onCreated(function() {
  var self = this;
  var dict = new ReactiveDict();
	self.dict = dict;
  self.dict.set("data",null);
  self.dict.set("page",1);
  self.dict.set("searchTerm","people");
  self.dict.set("searchType","all");
  self.autorun(function(){

  });
});

Template.Unsplash.onRendered(function() {
  var self = this;
  self.autorun(function(){
    //updateImages(self);
  });
});
Template.Unsplash.events({
	'click .search-images-button' (event, template){
		event.preventDefault();
    console.log(event);
    let searchTerm = $(".search-unsplash").val();
    console.log("searchTerm: " + searchTerm);
    if(searchTerm){
      Template.instance().dict.set("searchTerm",searchTerm);
      Template.instance().dict.set("page",1);
      updateImages(template);
    }
  },
  'click .prev-images-page' (event, template){
    event.preventDefault();
    let data = Template.instance().dict.get("data");
    let currentPage = Template.instance().dict.get("page");
    if(currentPage > 2){
      Template.instance().dict.set("page",(currentPage - 1));
      updateImages(template);
    }
  },
  'click .next-images-page' (event, template){
    event.preventDefault();
    let data = Template.instance().dict.get("data");
    let currentPage = Template.instance().dict.get("page");
    console.log("currentPage: " + currentPage);
    if(data){
      if(currentPage < data.totalPages){
        Template.instance().dict.set("page",(currentPage + 1));
        updateImages(template);
      }
    }
  },
  'click .unsplash-thumb-image' (event, template){
    let imageURL = "url('"+this.urls.raw + "&w=1500&dpi=2')";
    Session.set("unsplashURL",imageURL);
    console.log("unsplashURL: " + imageURL);
    //$("#header-title").css("color",this.color)
  }
});

Template.Unsplash.helpers({
  source: function(){
    console.log(this);
    if(typeof this.source != 'undefined'){
      return this.source;
    }
  },
  setSearchType: function(){
    console.log(this);
    let searchType = "all";
    if(typeof this.searchType != 'undefined'){
      searchType = this.searchType;
    }
    console.log("searchType: " + searchType);
    Template.instance().dict.set("searchType",searchType);
    updateImages(Template.instance());
  },
  searchTypeClass: function(){
    let searchType = Template.instance().dict.get("searchType");
    switch (searchType) {
      //cover should be editable and the image should be visible
      case 'landscape':
        return 'landscape';
      case 'portrait':
        return 'portrait';
      case 'square':
        return 'square';
      case 'all':
        return 'square';
      default:
        return 'square';
      }
  },
  currentPage: function(template){
    let currentPage = Template.instance().dict.get("page");
    if(currentPage){
      return currentPage;
    }else{
      //console.log("currentPage not set");
    }
    return 0;
  },
  totalPages: function(template){
    let data = Template.instance().dict.get("data");
    if(data){
      return data.totalPages;
    }else{
      //console.log("data not set");
    }
    return 0;
  },
  totalImages: function(template){
    let data = Template.instance().dict.get("data");
    if(data){
      return data.totalImages;
    }else{
      //console.log("data not set");
    }
    return 0;
  },
  images: function(template){
    let data = Template.instance().dict.get("data");
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

function updateImages(template){
  console.log("updateImages called");
  let searchType = template.dict.get("searchType");

  /*
    Unsplash provider has the following search options:

    landscape: searchLandscapes(query,page)
    portrait: searchPortraits(query,page)
    square: searchSquares(query,page)
    default: searchAll(query,page)
  */
  provider.setItemsPerPage(10);
  switch (searchType) {
    //cover should be editable and the image should be visible
    case 'landscape':
      console.log("landscape search");
      provider
        .searchLandscapes(template.dict.get("searchTerm"), template.dict.get("page"))
        .then(data => {
          //console.log(data);
          //self.data = new ReactiveVar(data);
          template.dict.set("data",data);
        })
        .catch(error => error);
        break;
    case 'portrait':
      console.log("portrait search");
      provider
        .searchPortraits(template.dict.get("searchTerm"), template.dict.get("page"))
        .then(data => {
          //console.log(data);
          //self.data = new ReactiveVar(data);
          template.dict.set("data",data);
        })
        .catch(error => error);
        break;
    case 'square':
      console.log("square search");
      provider
        .searchSquares(template.dict.get("searchTerm"), template.dict.get("page"))
        .then(data => {
          //console.log(data);
          //self.data = new ReactiveVar(data);
          template.dict.set("data",data);
        })
        .catch(error => error);
        break;
    default:
      console.log("default/all search");
      provider
        .searchAll(template.dict.get("searchTerm"), template.dict.get("page"))
        .then(data => {
          //console.log(data);
          //self.data = new ReactiveVar(data);
          template.dict.set("data",data);
        })
        .catch(error => error);
  }


}

//use these for fonts that are displayed over header
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
