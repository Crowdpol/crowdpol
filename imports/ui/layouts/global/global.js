import './global.html'

Template.Global.onCreated(function(){
  self = this;
  /*
  //Local Storage
  var communityId = LocalStore.get('communityId');
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

Template.Global.onRendered(function(){

});

Template.Global.events({
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

Template.Global.helpers({
  /*
  content: function(data){
    var template = Template.instance();
    console.log(this)
    console.log(template);
    return {
      cover: "NavigatorMenu",
      menu: "PresenceMenu",
      body: "ProposalBody"
    }
  },
  contentCover: function(){
    return "PresenceCover";
  },
  contentMenu: function(){
    return "NavigatorMenu";
  },
  contentBody: function(){
    return "NavigatorBody";
  },
  contentFooter: function(){
    return "NavigatorFooter";
  },
  */
});
