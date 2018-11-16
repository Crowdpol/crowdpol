import './about.html';
import Quill from 'quill'
import { Communities } from '../../../api/communities/Communities.js'
import RavenClient from 'raven-js';

Template.About.onCreated(function() {
  var self = this;
  self.community = new ReactiveVar();

  // Get subdomain from LocalStore and subscribe to community
  var subdomain = LocalStore.get('subdomain');
  Session.set("aboutText","");
  Session.set("editState",false);
  self.autorun(function(){
    self.subscribe('communities.subdomain', subdomain, function(){
    	self.community.set(Communities.findOne({subdomain: subdomain}));
      Session.set("aboutText",self.community.get().settings.aboutText);
    });
  });
});

Template.About.helpers({
  aboutText: function(){
    $('.ql-editor').innerHTML = Session.get("aboutText");
    return Template.instance().community.get().settings.aboutText;
  }
});

Template.AboutEdit.onRendered(function(){
  // Initialise Quill editor
  loadQuill();
});

Template.AboutEdit.helpers({
  aboutText: function(){
    //$('.ql-editor').innerHTML = Session.get("aboutText");
    return Session.get("aboutText");
  },
  setupQuill: function(){

  }
});

Template.AboutEdit.events({
  'click #edit-panel-link' (event,template){
    //event.preventDefault();
    //console.log(Session.get("aboutText"));
    let toolbar = template.find('.ql-toolbar');
    console.log(toolbar);
    if(toolbar == 'null'){
      console.log("toolbar found");
      console.log(toolbar);
    }else{
      console.log("toolbar not found");

      let quillEditor = template.find('.ql-editor');
      if(quillEditor != 'null'){
        template.find('.ql-editor').innerHTML = Session.get("aboutText");
      }
    }
    //$(".ql-toolbar").innerHTML(Template.instance().community.get().settings.aboutText);
  },
  'click #preview-panel' (event,template){
    event.preventDefault();
    var aboutText = template.find('.ql-editor').innerHTML;
    Session.set("aboutText",aboutText);
  },
  'blur .ql-editor' (event,template){
    var aboutText = template.find('.ql-editor').innerHTML;
    Session.set("aboutText",aboutText);
  },
  'click #save-about' (event,template){
    //console.log("save about page");
    let aboutText = template.find('.ql-editor').innerHTML;

    Meteor.call('updateAbout', aboutText, LocalStore.get('communityId'), function(error){
      if (error){
        RavenClient.captureException(error);
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('About page updated.', 'success');
      }
    });
    Session.set("editState",false);
  },
  'click #edit-content' (event, template){
    //console.log("edit me");

    Session.set("editState",true);
    loadQuill();
  }
});

function loadQuill(){
  var editor = new Quill(`#about-editor`, {
    modules: {
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
}
