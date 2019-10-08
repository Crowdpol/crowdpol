import './flagButton.html'

Template.FlagButton.onCreated(function(){

  self = this;
  //Local Storage
  var communityId = LocalStore.get('communityId');
  /*
  //Session variables
  Session.set('variableName','variableValue');
  //Reactive Variables
  self.reactiveVariable = new ReactiveVar([]);
  self.reactiveVariable.set("exampleData");
  //Reactive Dictionary
  var dict = new ReactiveDict();
  this.templateDictionary = dict;
  dict.set("communityId",LocalStore.get('communityId'));
  //subscriptions
  self.autorun(function() {
    self.subscribe("simpleSearch",Session.get('searchPhrase'),"delegate", communityId);
  });
  */
});
Template.FlagButton.onRendered(function(){

});

Template.FlagButton.events({
  'click .flag-button': function(event, template){
    console.log("flag button clicked");
    let contentType = event.currentTarget.getAttribute("data-content-type");
    let contentId = event.currentTarget.getAttribute("data-content-id");
    let authorId = event.currentTarget.getAttribute("data-content-author-id");
    if(contentId && contentType && authorId){
      let flagContent = {
        contentId: contentId,
        contentType: contentType,
        contentAuthor: authorId
      };
      Session.set("flagContent",flagContent);
      $('#draggable-flag-modal').show();
      $('#draggable-flag-modal').draggable();
      //$(".flag-modal").addClass('active');
      //$("#overlay").addClass('dark-overlay');
    }

  },
  /*
	'keyup #some-id': function(event, template){
		Session.set('searchPhrase',event.target.value);
	},
  'click .some-class': function(event, template){
    var communityId = Template.instance().templateDictionary.get( 'communityId' );
    delegateId = this._id;
    var ranks = Session.get('ranked');
    let settings = LocalStore.get('settings');
    let delegateLimit = -1;

    if(typeof settings != 'undefined'){
      //do something
    }
    Meteor.call('someMethod', someParameter, function(error, result){
      if(error) {
        RavenClient.captureException(error);
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert(TAPi18n.__('pages.delegates.alerts.ranking-updated'), 'success');
      }
    });
  },
  */
});
Template.FlagButton.helpers({
	isFlagged: function(){
    //communityId = Template.instance().templateDictionary.get( 'communityId' );
    //return communityId;
    return "outlined_flag";
  },
});
