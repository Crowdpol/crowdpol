import './taggle.html'
import Taggle from 'taggle'
import { Tags } from '../../../api/tags/Tags.js'
/*
Template.taggle.onCreated(function(){
  var self = this;
  self.availableTags = new ReactiveVar([]);
  self.matchedTags = new ReactiveVar([]);
  var communityId = LocalStore.get('communityId')
  self.autorun(function(){
    //subscribe to list of existing tags
    self.subscribe('tags.community', communityId);
    self.availableTags.set(Tags.find().pluck('keyword'));
  });
});

Template.taggle.events({
  'keyup input' (event, template) {
    var input = event.target.value;
    var matchedTags = matchTags(input, template.availableTags.get());
    template.matchedTags.set(matchedTags);
  },
  'mousedown .dropdown-item' (event, template) {
    taggle.add(event.target.dataset.keyword);
    template.matchedTags.set([]);
  },
  'focusout input' (event, template){
   template.matchedTags.set([]);
  }
})

Template.taggle.helpers({
  'matchedTags'() {
    //console.log(Template.instance().matchedTags.get());
    return Template.instance().matchedTags.get();
  }
})
*/

Template.NewTaggle.onCreated(function(){
  var self = this;
  self.availableTags = new ReactiveVar([]);
  self.matchedTags = new ReactiveVar([]);
  Session.set("selectedTags",[]);
  var communityId = LocalStore.get('communityId')
  self.autorun(function(){
    //subscribe to list of existing tags
    self.subscribe('tags.community', communityId);
    self.availableTags.set(Tags.find().pluck('keyword'));
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
    var key = event.keyCode;
    //check if return key was pressed
    if (key === 13) {
      addTag(event.target.value);
      $('#add-tag').val('');
      $('#matchedTagsList').hide();
    }else{
      $('#matchedTagsList').show();
      var input = event.target.value;
      var matchedTags = matchTags(input, template.availableTags.get());
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
    removeTag(event.target.dataset.keyword);
  }
})

Template.NewTaggle.helpers({
  'matchedTags'() {
    //console.log(Template.instance().matchedTags.get());
    return Template.instance().matchedTags.get();
  },
  'setTags'(tags) {
    if(typeof tags === 'undefined'){
      tags = [];
    }
    Session.set("selectedTags",tags);
  }
})

export function setupTaggle(){
  var placeholder = TAPi18n.__('components.taggle.placeholder')
  taggle = new Taggle('tags', {placeholder: placeholder, duplicateTagClass: 'bounce'});

  var container = taggle.getContainer();
  var input = taggle.getInput();

  return taggle;
}

export function getTags(){
  selectedTags = Session.get("selectedTags");
    if (typeof selectedTags == 'undefined') {
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

export function addTag(keyword){
    selectedTags = Session.get("selectedTags");//Template.instance().selectedTags.get();
    if (typeof selectedTags == 'undefined') {
      selectedTags = [];
    }
    keywordIndex = selectedTags.indexOf(keyword.toLowerCase());
    if(keywordIndex == -1){
      selectedTags.push(keyword.toLowerCase());
      //matchedTags = Template.instance().matchedTags.get();
      //removeStringFromArray(keyword,matchedTags);
      //Template.instance().selectedTags.set(selectedTags);
      Session.set("selectedTags",selectedTags);
      updateTags(keyword);
    }else{
      bounceTag(keyword);
    }
    return;
}

function updateTags(keyword){
  newTag = '<a class="tag tag-chip" id="keyword-'+keyword.toLowerCase()+'">'+keyword+
              '<button type="button" class="mdl-chip__action tag-chip-delete" data-keyword="'+keyword.toLowerCase()+'"><i class="material-icons tag-chip-delete" data-keyword="'+keyword.toLowerCase()+'">cancel</i></button>'+
           '</a>';
  $(".add-tags-wrap").append(newTag);
}
function removeTag(keyword){
  selectedTags = Session.get("selectedTags");//Template.instance().selectedTags.get();
  if (typeof selectedTags == 'undefined') {
    selectedTags = [];
  }
  keywordIndex = selectedTags.indexOf(keyword);
  if(keywordIndex > -1){
    removeStringFromArray(keyword,selectedTags);
    Session.set("selectedTags",selectedTags);
    selector = "#keyword-"+keyword;
    $(selector).remove();
  }
}

function bounceTag(keyword) {
  selector = "#keyword-"+keyword.toLowerCase();
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
*/
