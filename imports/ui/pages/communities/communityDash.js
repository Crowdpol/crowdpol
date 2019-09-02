import { Maps } from '../../../api/maps/Maps.js';
import { Posts } from '../../../api/posts/Posts.js'
import { Proposals } from '../../../api/proposals/Proposals.js';
import { Communities } from '../../../api/communities/Communities.js';
import { Groups } from '../../../api/group/Groups.js';
import { setCommunity } from '../../../utils/community';
import { userProfilePhoto} from '../../../utils/users';
import RavenClient from 'raven-js';
import './communityDash.html';

//declare global variables:
/*
let mapDataSet = {};
let communitiesDataSet = {};
let map = null;
let selection;
let selectedLayer;
let mapLayer;
var mapsData;
let info;
let communityInfo;
*/

Template.CommunityDash.onCreated(function(){
  self = this;
  var communityId = LocalStore.get('communityId');
  var dict = new ReactiveDict();
	self.dict = dict;
  self.openGroup = new ReactiveVar(true);
  dict.set('communityId',communityId);
  Session.set('selectedCommunity','Global');
  Session.set('selectedMap','GLOBAL');
  Session.set('breadcrumbs',['GLOBAL']);
  this.autorun(() => {
    self.subscribe('feed-posts', communityId);
    //self.subscribe("communities.all");//communityId);
    self.subscribe("groups.community",communityId);
    self.subscribe("proposals.community",communityId);
    //self.subcribe("users.community",LocalStore.get('communityId'));

  });

});

Template.CommunityDash.onRendered(function(){
  $('.mdl-layout__tab').on('click', function() {
	$this = $(this);
  if($this.hasClass('is-active')) return;

  $parent = $this.closest('.mdl-layout__tab-bar');
  $('.mdl-layout__tab', $parent).removeClass('is-active');
  $this.addClass('is-active');
})
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
  'click .sidebar-nav': function(event,template){
    event.preventDefault();
    $('.sidebar-nav').each(function(i, obj) {
      $(this).removeClass('active');
    });
    $(event.target).addClass('active');
    let id = "#" + event.target.dataset.id;
    console.log("id: " + id);
    $('.tabcontent').each(function(i, obj) {
      $(this).removeClass('active');
    });
    $(id).addClass('active');
  },
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
  },
  'click #create-post': function(event,template){
    event.preventDefault();
    var communityId = LocalStore.get('communityId');
    let message = template.find('#post-message').value
    let post = {
      userId: Meteor.userId(),
      feedId: communityId,
      message: message,
    };
    Meteor.call('createPost', post, function(error, postId){
  		if (error){
  			RavenClient.captureException(error);
  			Bert.alert(error.reason, 'danger');
  			return false;
  		} else {
  			 Bert.alert(TAPi18n.__('pages.feed.post-created'), 'success');
         template.find('#post-message').value = "";
         $("#post-message").addClass('post-textarea-small');
         $("#post-message").removeClass('post-textarea-large');
  		}
  	});
  }
});

Template.CommunityDash.helpers({
  communityFeed: function(){
    var communityId = LocalStore.get('communityId');
    console.log("db.posts.find({'feedId':'"+communityId+"'});")
    let posts = Posts.find({"feedId":communityId}, {sort: {createdAt: -1}});
  	return posts;
  },
  profilePic: function(userId) {
    return userProfilePhoto(userId);
  },
  communityMembers: function(){
    var communityId = LocalStore.get('communityId');
    return Meteor.users.find({"profile.communityIds" : communityId})
  },
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
    return Groups.find({communityId:LocalStore.get('communityId')});
  },
  currentCommunityProposalCount: function(){
    var communityId = LocalStore.get('communityId');
    return Proposals.find({stage: "live",communityId:LocalStore.get('communityId')}).count();
  },
  openProposals: function(isVotingAsDelegate) {
    var communityId = LocalStore.get('communityId');
    let now = moment().toDate();//new Date();
    let end = now;
    //TO DO: add option for admin to select delgate expiry date (currently 14 days before end date)
    if(isVotingAsDelegate){
      end =  moment(now).subtract(2, 'weeks').toDate();//now.setDate(now.getDate()-14).toString();
    }

    return Proposals.find({stage: "live",communityId:LocalStore.get('communityId')}, {sort: {endDate: 1,createdAt:-1}},{transform: transformProposal});
  },
  currentCommunity: function(){
    return Communities.findOne({"_id":LocalStore.get('communityId')});
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



//--------------------------------------------------------------------------------------------------------------//
function transformProposal(proposal) {
  var currentLang = TAPi18n.getLanguage();
  var endDate = proposal.endDate;
  var startDate = proposal.startDate;
  //Put dates in ISO format so they are compatible with moment
  endDate = endDate.toISOString();
  startDate = startDate.toISOString();
  proposal.endDate = endDate;
  proposal.startDate = startDate;
  var content = proposal.content;
  content.forEach(function (lang, index) {
    if(lang.language==currentLang){

      //var langContent = {
        proposal.title = lang.title
        proposal.abstract =lang.abstract;
        proposal.body = lang.body;
        proposal.pointsAgainst = lang.pointsAgainst;
        proposal.pointsFor = lang.pointsFor;
      //}
      //proposal.langContent = langContent;
    }
  });
  return proposal;
};

function openPage(pageName,elmnt,color) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablink");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].style.backgroundColor = "";
  }
  document.getElementById(pageName).style.display = "block";
  elmnt.style.backgroundColor = color;
}
