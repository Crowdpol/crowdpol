import './taggle.html'
import Taggle from 'taggle'
import { Tags } from '../../../api/tags/Tags.js'

Template.taggle.onCreated(function(){
  var self = this;
  self.autorun(function(){
    //subscribe to list of existing tags
    self.subscribe('tags.all');
  });
})

export function setupTaggle(){
  var taggle = new Taggle('tags', {placeholder: 'Add some tags', duplicateTagClass: 'bounce'});
  var availableTags = Tags.find().pluck('keyword');
  var container = taggle.getContainer();
  var input = taggle.getInput();

  $(input).autocomplete({
      source: availableTags,
      appendTo: container,
      position: { at: "left bottom", of: container },
      select: function(event, data) {
          event.preventDefault();
          //Add the tag if user clicks
          if (event.which === 1) {
              taggle.add(data.item.value);
          }
      }
  });

  return taggle;
}