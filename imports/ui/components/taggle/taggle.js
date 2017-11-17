import './taggle.html'
//import Taggle from './tagglejs.js'
import Taggle from 'taggle'
//import './taggle.css'

Template.taggle.onRendered(function(){
	
	var self = this;

	var taggle = new Taggle('tags', {placeholder: 'Tag your proposal',duplicateTagClass: 'bounce'});
  var availableTags = ['environment', 'politics', 'technology', 'economics']
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