import './communities.html';
import { Communities } from '../../../../api/communities/Communities.js'
import RavenClient from 'raven-js';

Template.AdminCommunities.onCreated(function() {
  var self = this;
  Session.set('showCommunityForm', false);
  self.community = new ReactiveVar([]);
  self.community.set(null);
  self.nameSearch = new ReactiveVar('');
  Session.set("searchString",'');
  self.autorun(function() {
    self.subscribe('communities.all');
    self.subscribe('adminSearch',Session.get("searchString"));
  });

});

Template.AdminCommunities.helpers({
  communitySelected: function(){
    let community = Template.instance().community.get();
    if(community){
      if(typeof community._id !== 'undefined'){
        return true;
      }
    }
    return false;
  },
  getParent: function(parentId){
    if(parentId){
      let community = Communities.findOne({"_id":parentId});
      if(community){
        if(typeof community.name !== 'undefined'){
          return community.name;
        }
      }
    }
  },
  communityName: function(){
    let community = Template.instance().community.get();

    if(community){
      console.log(community._id);
      if(typeof community.name !== 'undefined'){
        return community.name;
      }else{
        console.log("no community name");
      }
    }else{
      console.log("community not defined");
    }
  },
  isRootCommunity: function(){
    let community = Template.instance().community.get();
    if(community){
      if(typeof community.isRoot !== 'undefined'){
        if(community.isRoot){
          document.querySelector('#root-check-label').MaterialCheckbox.check();
          $("#parent-wrapper").hide();
          $('#subdomain-wrapper').show();
        }else{
          document.querySelector('#root-check-label').MaterialCheckbox.uncheck();
          $("#parent-wrapper").show();
          $('#subdomain-wrapper').hide();
        }
      }
    }
  },
  communitySubdomain: function(){
    let community = Template.instance().community.get();
    if(community){
      if(typeof community.subdomain){
        return community.subdomain;
      }
    }
  },
  rootCommunityName: function(){
    let community = Template.instance().community.get();
    if(community){
      if(typeof community.parentCommunity){
        let communityId = community.parentCommunity;
        let parent = Communities.findOne({"_id":communityId});
        if(parent){
          if(typeof parent.name !== 'undefined'){
            return parent.name;
          }
        }
      }
    }
  },
  rootCommunityId: function(){
    let community = Template.instance().community.get();
    if(community){
      if(typeof community._id){
        return community._id;
      }
    }
  },
  communities: function() {
    return Communities.find({});
  },
  rootCommunities: function() {
    let community = Template.instance().community.get();
    if(community){
      if(typeof community._id){
        return Communities.find({_id:{$ne:community._id}});
      }
    }
    console.log("could not find template.communities id");
    return Communities.find({});
  },
  userCount: function(communityId) {
  	return Meteor.users.find({'profile.communityIds': communityId}).count();
  },
  userSearch: function(){
    return Meteor.users.find({},{limit: 5});
  },
  communityAdmins: function(){
    let community = Template.instance().community.get();
    if(community){
      if(typeof community._id !== 'undefined'){
        return Meteor.users.find({"profile.adminCommunities":community._id});
      }else{
        console.log("communityAdmins:c ould not find community id");
      }
    }else{
      console.log("communityAdmins: could not find community id");
    }
  },
  showSearchResults: function(){
    let searchString = Session.get("searchString");
    if(searchString.length > 0){
      return true;
    }
    return false;
  }
});

Template.AdminCommunities.events({
  'click .community-row': function(event,template){
    let id = event.currentTarget.dataset.id;
    let community = Communities.findOne({"_id":id});
    resetForm(template);
    $("#add-button-group").hide();
    $("#save-button-group").show();
    Template.instance().community.set(community);
    event.stopImmediatePropagation();
  },
  'click #root-checkbox': function(event, template){
    let val = ($('#root-checkbox').is(":checked"));
    if(val){
      $("#parent-wrapper").hide();
      $('#subdomain-wrapper').show();
      $('#colorScheme-wrapper').show();
    }else{
      $("#parent-wrapper").show();
      $('#subdomain-wrapper').hide();
      $('#colorScheme-wrapper').hide();
    }
  },
  'click .dropdown-item-parent-community': function(event, template){
		template.find('#parentCommunityId').value = event.target.dataset.val;
		template.find('#parentCommunity').value = event.target.dataset.name;
    $("#parent-wrapper > div.mdl-menu__container").removeClass("is-visible");
	},
  'click #enforceWhitelist': function(event, template){
    let val = ($('#enforceWhitelist').is(":checked"));
    if(val){
      $("#emailWhitelist").attr("disabled", "disabled");
    }else {
      $("#emailWhitelist").removeAttr("disabled");
    }
  },
  'click #cancel-update': function(event,template){
    event.preventDefault();
    resetForm(template);
    $("#add-button-group").show();
    $("#save-button-group").hide();
  },
  'click #add-community': function(event,template){
    event.preventDefault();
    let isRoot = false;
    let showLanguageSelector = false;
    //let parentCommunity = template.find("#parentCommunityId").value;
    let isRootCheckbox = $('#root-checkbox').is(":checked");
    if(isRootCheckbox){
      console.log("isRootCheckbox is set");
      isRoot = true;
    }else{
      console.log("isRootCheckbox is not set");
      isRoot = false;
    }
    var community = {
      name: template.find("#name").value,
      subdomain: template.find("#subdomain").value,
      isRoot: isRoot,
      parentCommunity: template.find("#parentCommunityId").value,
      settings: {
        languageSelector: false,
        defaultLanguage: 'en',
        languages: ['en'],
        enforceWhitelist: false,
        showDates: true,
      },
      isArchived: false,
    }
    Meteor.call('createCommunity', community, function(error){
      if (error){
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert("Community created.", 'success');
        resetForm(template);
      }
    });
  },
  /*'click .edit-community': function(event, template){
    event.preventDefault();
    let id = event.currentTarget.dataset.id;
    let community = Communities.findOne({"_id":id});
    resetForm(template);
    $("#add-button-group").hide();
    $("#save-button-group").show();
    console.log("about to set new form instance: " + community._id);
    Template.instance().community.set(community);
    event.stopImmediatePropagation();
  },*/
  'click .delete-community': function(event, template){
    event.preventDefault();
    let id = event.currentTarget.dataset.id;
    if(id){
      Meteor.call('deleteCommunity', id, function(error){
        if (error){
          Bert.alert(error.reason, 'danger');
        } else {
          Bert.alert("Community removed.", 'success');
        }
      });
    }
  },
	'click .dropdown-item-defaultLanguage': function(event, template){
		template.find('#defaultLanguage').dataset.val = event.target.dataset.val;
		template.find('#defaultLanguage').value = event.target.dataset.val;
	},
	'click .dropdown-item-colorScheme': function(event, template){
		template.find('#colorScheme').dataset.val = event.target.dataset.val;
		template.find('#colorScheme').value = TAPi18n.__('admin.communities.colorScheme.' + event.target.dataset.val);
	},
	'click #save-community': function(event, template){
		event.preventDefault();
    //set default variables
    let isRoot = false;
    let showLanguageSelector = false;
    //set form variables
    let parentCommunity = template.find("#parentCommunityId").value;
    let subdomain = template.find("#subdomain").value;
    let isRootCheckbox = $('#root-checkbox').is(":checked");
    if(isRootCheckbox){
      console.log("isRootCheckbox is set");
      isRoot = true;
      parentCommunity = '';
    }else{
      console.log("isRootCheckbox is not set");
      isRoot = false;
      subdomain = '';
    }

    let community = Template.instance().community.get();
    let communityId = null;
    let communitySettings = {
      languageSelector: false,
      defaultLanguage: 'en',
      languages: ['en'],
      enforceWhitelist: false,
      showDates: true
    }
    if(community){
      if(typeof community._id !== 'undefined'){
          communityId = community._id;
      }
      if(typeof community.settings !== 'undefined'){
        communitySettings = community.settings;
        if(typeof community.languageSelector !== 'undefined'){
          communitySettings.languageSelector = community.languageSelector;
        }
        if(typeof community.defaultLanguage !== 'undefined'){
          communitySettings.defaultLanguage = community.defaultLanguage;
        }
        if(typeof community.languages !== 'undefined'){
          communitySettings.languages = community.languages;
        }
        if(typeof community.enforceWhitelist !== 'undefined'){
          communitySettings.enforceWhitelist = community.enforceWhitelist;
        }
        if(typeof community.showDates !== 'undefined'){
          communitySettings.showDates = community.showDates;
        }
      }
    }
    community = {
      _id: communityId,
  		name: template.find("#name").value,
  		subdomain: subdomain,
      isRoot: isRoot,
      isArchived: false,
      parentCommunity: parentCommunity,
      settings: communitySettings
  	}
    Meteor.call('editCommunity', community, function(error){
      if (error){
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert("Community edited.", 'success');
        resetForm(template);
      }
    });
	},
  'keyup #searchString': function(event, template){
    Session.set('searchString',event.target.value);
  },
  'click .add-admin': function(event, template){
    event.preventDefault();
    let community = Template.instance().community.get();
    if(community){
      if(typeof community._id !== 'undefined'){
        let userId = event.currentTarget.dataset.id;
        Meteor.call('addAdminToCommunity', userId,community._id,'true', function(error){
          if (error){
            Bert.alert(error.reason, 'danger');
          } else {
            Bert.alert("Community admin added", 'success');
            $("#searchString").val('');
            Session.set("searchString","");
          }
        });
      }
    }
    event.stopImmediatePropagation();
  },
  'click .remove-admin': function(event, template){
    event.preventDefault();
    let community = Template.instance().community.get();
    if(community){
      if(typeof community._id !== 'undefined'){
        let userId = event.currentTarget.dataset.id;
        Meteor.call('removeAdminFromCommunity', userId,community._id, function(error){
          if (error){
            Bert.alert(error.reason, 'danger');
          } else {
            Bert.alert("Community admin removed", 'success');
            $("#searchString").val('');
            Session.set("searchString","");
          }
        });
      }
    }
    event.stopImmediatePropagation();
  }
});

function resetForm(template){
  //document.getElementById("community-form").reset();
  template.community.set(null);
  $("#parentCommunityId").val('');
  $("#parentCommunity").val('');
  console.log("form finished resetting");
}
