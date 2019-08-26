import { Communities } from '../../../api/communities/Communities.js';
import { Groups } from '../../../api/group/Groups.js';
import { setCommunity } from '../../../utils/community';
import RavenClient from 'raven-js';
import './communityDash.html';

Template.CommunityDash.onCreated(function(){
  self = this;
  //Local Storage
  var communityId = LocalStore.get('communityId');
  self.openGroup = new ReactiveVar(true);
  /*
  //Session variables
  Session.set('variableName','variableValue');
  //Reactive Variables
  self.reactiveVariable = new ReactiveVar([]);
  self.reactiveVariable.set("exampleData");
  //Reactive Dictionary
  */
  var dict = new ReactiveDict();
  this.templateDictionary = dict;
  dict.set("communityId",communityId);
  //subscriptions
  self.autorun(function() {
    //self.subscribe("maps.children",LocalStore.get('communityId'));
    self.subscribe("maps.all");
    self.subscribe("communities.children",LocalStore.get('communityId'));
    self.subscribe("groups.community",LocalStore.get('communityId'));
  });
  /*
  $('.page-content').scroll(function(){
    console.log("scrolling");
  });
  */
});

Template.CommunityDash.onRendered(function(){
  /* TODO: Standardise form validation
  $( "#create-group-form" ).validate({
    rules: {
      'group-name': {
        required: true
      },
      'group-username': {
        required: true
      },
    },
    messages: {
      'group-name': {
        required: 'Please enter a group name.'
      },
      'group-username': {
        required: 'Please enter a group username.'
      },
    }
  });
  */
  
});

Template.CommunityDash.events({
  'click .community-card-image': function(event, template){
    let id = event.currentTarget.dataset.id;
    if(id){
      setCommunity(id);
      tabcontent = document.getElementsByClassName("community-tab");
      for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
      }
      $("#communities-tab").show();
      $('*[data-tab="communities-tab"]').addClass("active");

      /*
      LocalStore.set('communityId', id);
      let settings = LocalStore.get('settings');
      let defaultLang = "en";
      if(typeof settings.defaultLanguage){
        console.log(settings);
        defaultLang = settings.defaultLanguage;
      }
      console.log("defaultLang: " + defaultLang);
      Session.set("i18n_lang",defaultLang)
      //TAPi18n.setLanguage(defaultLang);
      /* TODO: change locale dynamically*/
      //moment.locale(defaultLang);
    }
    /*
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
    */
  },
  'click .tablinks': function(event, template){
    let tab = event.currentTarget.dataset.tab;
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("community-tab");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tab).style.display = "flex";
    event.currentTarget.className += " active";
  },
  'click .create-group': function(event, template){
    openCreateGroupModal()
  },
  'click #overlay, click #reject-button' (event, template){
    closeCreateGroupModal();
  },
  'click #group-open': function(event, template){
    template.openGroup.set(!template.openGroup.get());
  },
  'click #create-group': function(event, template){
    event.preventDefault();
    let group = {
      name: $("#group-name").val(),
      handle: $("#group-username").val(),
      isOpen: template.openGroup.get(),
      communityId: LocalStore.get('communityId'),
      isArchived: false
    }
    console.log(group);
    if(group.name == ''){
      Bert.alert("Name required","danger");
      return false;
    }
    if(group.handle == ''){
      Bert.alert("Username required","danger");
      return false;
    }

    Meteor.call('addGroup', group, function(error, result){
      if(error) {
        RavenClient.captureException(error);
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert("Group created","success");
        //Bert.alert(TAPi18n.__('pages.delegates.alerts.ranking-updated'), 'success');
      }
    });
  },
  'click .group-card': function(event, template){
    event.preventDefault();
  }
});

Template.CommunityDash.helpers({
  currentCommunity: function(){
    var communityId = LocalStore.get('communityId');
    let community = Communities.findOne({"_id":communityId});
    if(community){
      return community;
    }
  },
	childCommunities: function(){
    var communityId = LocalStore.get('communityId');
    return Communities.find({"parentCommunity":communityId});
  },
  childCommunitiesCount: function(){
    var communityId = LocalStore.get('communityId');
    return Communities.find({"parentCommunity":communityId}).count();
  },
  communityGroupCount: function(){
    return 1;
  },
  delegatesCount: function(){
    return 1;
  },
  backgroundImage: function(community){
    if(community){
      if(typeof community.settings !== 'undefined'){
        let settings = community.settings;
        //console.log(settings);
        if(typeof settings.homepageImageUrl !== 'undefined');{
          //console.log(settings.homepageImageUrl);
          return settings.homepageImageUrl;
        }
      }
    }
    return 'url(https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjUxNTY3fQ&w=1500&dpi=2';
  },
  groups: function(){
    //console.log("Groups count: " + Groups.find().count());
    return Groups.find();
  }
});

openCreateGroupModal = function(event) {
  $(".create-group-modal").addClass('active');
  $("#overlay").addClass('dark-overlay');
}

closeCreateGroupModal = function(event) {
  $(".create-group-modal").removeClass('active');
  $("#overlay").removeClass('dark-overlay');
}
/*
Template.CreateGroupModal.events({
  'click #create-group': function(event, template){
    event.preventDefault();
    console.log("creating group");
  }
})
*/
