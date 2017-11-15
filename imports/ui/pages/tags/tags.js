import "./tags.html";

Template.TagSearch.onCreated(function(){	   
	var self = this;
	self.autorun(function() {
		var id = FlowRouter.getParam(':id');
		console.log("Tag keyword: " + id);
	});
});

Template.TagSearch.helpers({
	keyword(){
		return FlowRouter.getParam(':id');
	}
});