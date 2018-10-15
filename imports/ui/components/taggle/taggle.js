import './taggle.html'
import { Tags } from '../../../api/tags/Tags.js'
import RavenClient from 'raven-js';


/* SIMPLE COMPONENT THAT ACCEPTS AN ARRAY OF TAG IDS AND RETURNS THE SAME */


Template.NewTaggle.onCreated(function(){
  var self = this;
  self.availableTags = new ReactiveVar([]);
  self.matchedTags = new ReactiveVar([]);
  //Session.set("selectedTags",[]);
  var communityId = LocalStore.get('communityId')
  self.autorun(function(){
    //subscribe to list of existing tags
    self.subscribe('tags.community', communityId);
    //self.availableTags.set(Tags.find().pluck('keyword'));
  });
});
/*
Template.NewTaggle.onRendered(function(){
  //var topPosition = ($('#tag-input-wrap').offset().top - 10) + 'px';
  //console.log(topPosition);
  //$("#matchedTagsList").css({ top: topPosition });
})
*/
Template.NewTaggle.events({
  'keyup input' (event, template) {
    event.preventDefault();
    var key = event.keyCode;
    //console.log(key);
    //check if return key was pressed
    if (key === 13) {
      addTag(event.target.value);
      $('#add-tag').val('');
      $('#matchedTagsList').hide();
    }else{
      $('#matchedTagsList').show();
      var input = event.target.value;
      var matchedTags = matchTags(input, template.availableTags.get());
      //console.log("outputting matchedTags: ");
      //console.log(matchedTags);
      if(matchedTags.length){
        template.matchedTags.set(matchedTags);
      }else{
        template.matchedTags.set([event.target.value]);
      }
    }

  },
  'mousedown .dropdown-item' (event, template) {
    //console.log(event.target.dataset.keyword);
    addTag(event.target.dataset.keyword);
    $('#add-tag').val('');
    //taggle.add(event.target.dataset.keyword);
    template.matchedTags.set([]);
    $('#matchedTagsList').hide();
  },
  'focusout input' (event, template){
   template.matchedTags.set([]);
   $('#matchedTagsList').hide();
  },
  'focus input' (event, template){
   ///template.matchedTags.set([]);
   $('#matchedTagsList').show();
  },
  'click .tag-chip-delete' (event, template){
    //console.log(event.target.dataset.id)
    removeTag(event.target.dataset.id);
  }
})

Template.NewTaggle.helpers({
  'matchedTags'() {
    //console.log(Template.instance().matchedTags.get());
    return Template.instance().matchedTags.get();
  },
  'setTags'(tags) {
    //tags are the array
    if(typeof tags === 'undefined'){
      tags = [];
    }
    //console.log("set tags");
    //console.log(tags);
    updateSessionTags(tags);
  },
  'foundTags'(){
    let idArray = Session.get("selectedTags");
    //console.log(idArray);
    let foundTags = Tags.find({_id: {$in: idArray}});
    //console.log(foundTags.count());
    return foundTags;
  },
  'isAuthorised'(tag){
    //console.log("isAuthorised: " + tag.keyword);
    if(tag.authorized){
      return 'tag-authorised';
    }else{
      return 'tag-not-authorised';
    }
  }
})

export function getTags(){
  selectedTags = Session.get("selectedTags");
  //console.log(selectedTags);
    if (typeof selectedTags == 'undefined') {
      //console.log("session is undefined");
      selectedTags = [];
    }
  //console.log(selectedTags);
  return selectedTags;
}

function matchTags(input, tags) {
  if (!input) {
    input = '*'
  }
  var reg = new RegExp(input.split('').join('\\w*').replace(/\W/, ""), 'i');
    return tags.filter(function(tag) {
      if (tag.match(reg)) {
        return tag;
      }
    });
}

export function addTag(id){
    selectedTags = Session.get("selectedTags");//Template.instance().selectedTags.get();
    if (typeof selectedTags == 'undefined') {
      selectedTags = [];
    }
    let communityId = LocalStore.get('communityId')
    let idIndex = selectedTags.indexOf(id);
    if(idIndex == -1){
      Meteor.call('addTag',id,communityId, function(error,tag){
      	if (error){
          RavenClient.captureException(error);
          Bert.alert(error.reason, 'danger');
          return false;
        }else{
          selectedTags.push(tag);
          //matchedTags = Template.instance().matchedTags.get();
          //removeStringFromArray(keyword,matchedTags);
          //Template.instance().selectedTags.set(selectedTags);
          updateSessionTags(selectedTags);
          //updateTags(keyword);
        }
      });
    }else{
      //console.log("bouncing: " + id);
      bounceTag(id);
    }
    return;
}
export function updateSessionTags(tagsArray){
  if(typeof tagsArray != 'undefined'){
    let sanitisedArray = tagsArray.filter((element, index) => (tagsArray.indexOf(element) == index));
    Session.set("selectedTags",tagsArray);
  }
}
function updateTags(keyword){
  newTag = '<a class="tag tag-chip" id="keyword-'+keyword.toLowerCase()+'">'
              +keyword+
              '<button type="button" class="mdl-chip__action tag-chip-delete" data-keyword="'+keyword.toLowerCase()+'">'+
                '<i class="material-icons tag-chip-delete" data-keyword="'+keyword.toLowerCase()+'">cancel</i>'+
              '</button>'+
           '</a>';
  //$(".add-tags-wrap").append(newTag);
}
function removeTag(keyword){
  selectedTags = Session.get("selectedTags");//Template.instance().selectedTags.get();
  if (typeof selectedTags == 'undefined') {
    selectedTags = [];
  }
  //console.log(selectedTags);
  keywordIndex = selectedTags.indexOf(keyword);
  if(keywordIndex > -1){
    //console.log(selectedTags);
    updatedArray = removeStringFromArray(keyword,selectedTags);
    //console.log(selectedTags);
    //console.log(updatedArray);
    updateSessionTags(selectedTags);
    selector = "#keyword-"+keyword;
    $(selector).remove();
  }else{
    //console.log("could not find: " + keyword);
  }
}

function bounceTag(id) {
  selector = "[data-id='"+id+"'].taggle-tag";
  //console.log(selector);
  for(i = 0; i < 3; i++) {
    $(selector).fadeTo("fast", 0.15).fadeTo("fast", 1);
  }
}

function removeStringFromArray(keyword,array){
  for (var i=array.length-1; i>=0; i--) {
    if (array[i].toLowerCase() === keyword.toLowerCase()) {
      array.splice(i, 1);
      return array;       //<-- Uncomment  if only the first term has to be removed
    }
  }
  return array;
}
/*
window.onresize = function(event) {
  //var topPosition = ($('#tag-input-wrap').offset().top - 10) + 'px';
  //console.log(topPosition);
  //$("#matchedTagsList").css({ top: topPosition });
};


function sanitizeTagArray(tagArray){
  //console.log(tagArray)
  var b = tagArray.filter((element, index) => (tagArray.indexOf(element) == index));
  //console.log(b);
  return b;
}
*/
