import './communities.html';
import { Communities } from '../../../../api/communities/Communities.js'
import RavenClient from 'raven-js';

Template.AdminCommunities.onCreated(function() {
  var self = this;
  Session.set('showCommunityForm', false);
  self.community = new ReactiveVar([]);
  self.community.set(null);
  self.nameSearch = new ReactiveVar('');
  self.autorun(function() {
    self.subscribe('communities.all');
    self.subscribe('users.all');
  });

});

Template.AdminCommunities.helpers({
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
      if(typeof community.name !== 'undefined'){
        return community.name;
      }
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
    return Communities.find({});
  },
  userCount: function(communityId) {
  	return Meteor.users.find({'profile.communityIds': communityId}).count();
  }
});

Template.AdminCommunities.events({
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
    resetForm();
    $("#add-button-group").show();
    $("#save-button-group").hide();
  },
  'click #add-community': function(event,template){
    event.preventDefault();
    let isRoot = false;
    let showLanguageSelector = false;
    let parentCommunity = template.find("#parentCommunityId").value;
    let val = $('#enforceWhitelist').is(":checked");
    if(val){
      isRoot = true;
    }
    var community = {
      name: template.find("#name").value,
      subdomain: template.find("#subdomain").value,
      isRoot: isRoot,
      parentCommunity: parentCommunity,
      settings: {
        languageSelector: false,
        defaultLanguage: 'en',
        languages: ['en'],
        enforceWhitelist: false,
        showDates: true,
      }
    }
    Meteor.call('createCommunity', community, function(error){
      if (error){
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert("Community created.", 'success');
        resetForm();
      }
    });
  },
  'click .edit-community': function(event, template){
    event.preventDefault();
    resetForm();
    $("#add-button-group").hide();
    $("#save-button-group").show();
    let id = event.currentTarget.dataset.id;
    let community = Communities.findOne({"_id":id});
    Template.instance().community.set(community);
    event.stopImmediatePropagation();
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
    let isRoot = false;
    let showLanguageSelector = false;
    let parentCommunity = template.find("#parentCommunityId").value;
    let subdomain = template.find("#subdomain").value;
    let val = $('#root-checkbox').is(":checked");
    if(val){
      isRoot = true;
    }else{
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
        }
      }
      community = {
        _id: communityId,
  			name: template.find("#name").value,
  			subdomain: subdomain,
        isRoot: isRoot,
        parentCommunity: parentCommunity,
        settings: communitySettings
  		}
      Meteor.call('editCommunity', community, function(error){
        if (error){
          Bert.alert(error.reason, 'danger');
        } else {
          Bert.alert("Community edited.", 'success');
          resetForm();
        }
      });
	},
});

function resetForm(){
  document.getElementById("community-form").reset();
  $("#parentCommunityId").val('');
  $("#parentCommunity").val('');
}
