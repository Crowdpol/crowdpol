import "./faq.html"
import { Communities } from '../../../api/communities/Communities.js'
import Quill from 'quill'
import { Random } from 'meteor/random';
import RavenClient from 'raven-js';

Template.FAQ.onCreated(function(){
  self = this;
  var communityId = LocalStore.get('communityId');
  var dict = new ReactiveDict();
	self.dict = dict;
  self.autorun(function(){
    self.subscribe('communities.all')
    if (communityId){
      // Edit an existing proposal
      self.subscribe('community', communityId, function(){
        settings = Communities.findOne({_id: communityId}).settings;
        dict.set( 'faqs', settings.faqs || null);
      });
    }
  });

});

Template.FAQ.onRendered(function(){
  // Initialise Quill editor
	var editor = new Quill(`#answer-editor`, {
		modules: {
      /*
			toolbar: [
			['bold', 'italic', 'underline'],
			['image', 'blockquote', 'link']
			]
      */
      toolbar: [
       ['bold', 'italic', 'underline'],        // toggled buttons
       ['blockquote', 'code-block','link'],
       [{ 'header': 1 }, { 'header': 2 }],               // custom button values
       [{ 'list': 'ordered'}, { 'list': 'bullet' }],
       [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
       ['clean']
     ]
		},
		theme: 'snow'
	});
});

Template.FAQ.events({
  'click .accordian-item' (event, template){
    $(event.currentTarget).toggleClass("active");
  },
  'click #add-faq' (event, template){
    event.preventDefault();
    let faqContent = {
      _id: Random.id(),
      lang: 'en',
      question: $("#faq-question").val(),
      answer: template.find('.ql-editor').innerHTML,
      userId: Meteor.userId()
    }
    Meteor.call('addFAQ', LocalStore.get('communityId'),faqContent, function(error){
      if (error){
        RavenClient.captureException(error);
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('FAQ added.', 'success');
      }
    });
  }
});

Template.FAQ.helpers({
  faq: function(){
    faqs = Communities.findOne({_id: LocalStore.get('communityId')}).faqs;
    return faqs;
  }
});
