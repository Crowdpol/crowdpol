import './taggle.html'
import Taggle from 'taggle'
import { Tags } from '../../../api/tags/Tags.js'

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
  'mousedown .autocomplete-item' (event, template) {
    taggle.add(event.target.dataset.keyword);
    template.matchedTags.set([]);
  },
  'focusout input' (event, template){
   template.matchedTags.set([]);
  }
})

Template.taggle.helpers({
  'matchedTags'() {
    console.log(Template.instance().matchedTags.get());
    return Template.instance().matchedTags.get();
  }
})

Template.NewTaggle.onCreated(function(){
  var self = this;
  self.availableTags = new ReactiveVar([]);
  self.matchedTags = new ReactiveVar([]);
  self.selectedTags = new ReactiveVar(["test","test2"]);
  var communityId = LocalStore.get('communityId')
  self.autorun(function(){
    //subscribe to list of existing tags
    self.subscribe('tags.community', communityId);
    self.availableTags.set(Tags.find().pluck('keyword'));
  });
});

Template.NewTaggle.events({
  'keyup input' (event, template) {
    //check if return key was pressed
    if (event.which === 13) {
      addTag(event.target.value);
      $('#add-tag').val('');
    }else{
      var input = event.target.value;
      var matchedTags = matchTags(input, template.availableTags.get());
      template.matchedTags.set(matchedTags);
    }
    
  },
  'mousedown .autocomplete-item' (event, template) {
    addTag(event.target.dataset.keyword);
    $('#add-tag').val('');
    //taggle.add(event.target.dataset.keyword);
    template.matchedTags.set([]);
  },
  'focusout input' (event, template){
   template.matchedTags.set([]);
  }
})

Template.NewTaggle.helpers({
  'matchedTags'() {
    //console.log(Template.instance().matchedTags.get());
    return Template.instance().matchedTags.get();
  },
  'selectedTags'(){
    console.log(Template.instance().selectedTags.get());
    selectedTags = Template.instance().selectedTags.get();
    return selectedTags;
  }
})

export function setupTaggle(){
  var placeholder = TAPi18n.__('components.taggle.placeholder')
  taggle = new Taggle('tags', {placeholder: placeholder, duplicateTagClass: 'bounce'});

  var container = taggle.getContainer();
  var input = taggle.getInput();

  return taggle;
}

function matchTags(input, tags) {
  if (input) {
    var reg = new RegExp(input.split('').join('\\w*').replace(/\W/, ""), 'i');
    return tags.filter(function(tag) {
      if (tag.match(reg)) {
        return tag;
      }
    });
  } else {
    return [];
  } 
}

function addTag(keyword){
    selectedTags = Template.instance().selectedTags.get();
    keywordIndex = selectedTags.indexOf(keyword);
    if(keywordIndex == -1){
      console.log("adding tag");
      selectedTags.push(keyword);
      Template.instance().matchedTags.set(selectedTags);
      updateTags(keyword);
    }else{
      bounceTag(keywordIndex);
    }
    return;   
}
function bounceTag(keywordIndex){
  console.log("bounce index: " + keywordIndex);
}
function updateTags(keyword){
  newTag = '<a class="tag tag-chip">'+keyword+
              '<button type="button" class="mdl-chip__action"><i class="material-icons">cancel</i></button>'+
           '</a>';
  $(".add-tags-wrap").append(newTag);
}