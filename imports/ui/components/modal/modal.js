import './modal.html'

Template.modal.events({
	'click #mdl-custom-btn': function(event, template){
		'use strict';
		template.find('#mdl-custom-modal').style.display = "block";
	},
	'click .mdl-custom-close': function(event, template){
		'use strict';	
		template.find('#mdl-custom-modal').style.display = "none";
	},
	'click window': function(event, template){
		'use strict';
		var modal = template.find('#mdl-custom-modal')
	    if (event.target == modal) {
	        modal.style.display = "none";
	    }
	}
});