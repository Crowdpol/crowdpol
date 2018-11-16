import './about.html';
import Quill from 'quill'

Template.AdminSettingsAbout.onRendered(function(){
	var self = this;

	// Initialise Quill editor
	var editor = new Quill(`#about-editor`, {
		modules: {
      /*
			toolbar: [
			['bold', 'italic', 'underline'],
			['image', 'blockquote', 'link']
			]
      */
      toolbar: [
       ['bold', 'italic', 'underline'],        // toggled buttons
       ['blockquote', 'code-block'],
       [{ 'header': 1 }, { 'header': 2 }],               // custom button values
       [{ 'list': 'ordered'}, { 'list': 'bullet' }],
       [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
       ['clean']
     ]
		},
		theme: 'snow'
	});
  self.find('.ql-editor').innerHTML = Session.get("aboutText");
  $("#about-preview").hide();
});

Template.AdminSettingsAbout.helpers({
	aboutTextPreview(){
		return Session.get("aboutText");
	}
});

Template.AdminSettingsAbout.events({
  'click #edit-about' (event,template){
    event.preventDefault();
    $("#about-editor").show();
    $("#about-preview").hide();
    $(".ql-toolbar").show();
  },
  'click #preview-about' (event,template){
    event.preventDefault();
    $("#about-editor")
    $("#about-preview").show();
    $("#about-editor").hide();
    $(".ql-toolbar").hide();
    var aboutText = template.find('.ql-editor').innerHTML;
    Session.set("aboutText",aboutText);
  },
  'blur .ql-editor' (event,template){
    var aboutText = template.find('.ql-editor').innerHTML;
    Session.set("aboutText",aboutText);
  }
});

export function getAboutText(){
  return Session.get("aboutText");
}
