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


Template.taggle.onRendered(function(){
  taggle = new Taggle('tags', {placeholder: 'Tag your proposal', duplicateTagClass: 'bounce'});
  var availableTags = Tags.find().pluck('text');
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
	
});