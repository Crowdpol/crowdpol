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
    return Template.instance().matchedTags.get();
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
