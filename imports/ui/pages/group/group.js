import { Groups } from '../../../api/group/Groups.js';
import { Posts } from '../../../api/posts/Posts.js'
import RavenClient from 'raven-js';
import './group.html'

Template.Group.onCreated(function(){
  self = this;
  //Local Storage
  var communityId = LocalStore.get('communityId');
  var handle = FlowRouter.getParam("handle");
  console.log("handle: " + handle);

  //Reactive Dictionary
  var dict = new ReactiveDict();
  this.templateDictionary = dict;
  dict.set("communityId",LocalStore.get('communityId'));
  dict.set("handle",handle);
  //subscriptions
  self.autorun(function() {
    self.subscribe("groups.handle",handle, function(error){
      if (error){
        RavenClient.captureException(error);
        Bert.alert(error.reason, 'danger');
      } else {
        if(Groups.find().count()){
          let group = Groups.findOne({handle: handle})
          if(group){
            self.subscribe('feed-posts', group._id);
            dict.set("group",group);
          }
        }else{
          Bert.alert('Group not found','danger');
          //FlowRouter.go('/dash');
        }

        /*
        dict.set( 'createdAt', proposal.createdAt );
        dict.set( '_id', proposal._id);
        dict.set( 'anonymous', proposal.anonymous || false );
        dict.set( 'startDate', moment(proposal.startDate).format('YYYY-MM-DD') );
        dict.set( 'endDate', moment(proposal.endDate).format('YYYY-MM-DD') );
        dict.set( 'invited', proposal.invited );
        dict.set( 'authorId', proposal.authorId );
        dict.set( 'stage', proposal.st age );
        dict.set( 'status', proposal.status );
        dict.set( 'signatures', proposal.signatures || []);
        dict.set( 'tags', proposal.tags || [] );
        dict.set('hasCover',proposal.hasCover);
        dict.set('eventLogs',proposal.eventLog || []);
        Session.set('hasCover',proposal.hasCover);
        if(proposal.hasCover){
          Session.set('coverPosition',proposal.coverPosition);
          Session.set('coverURL',proposal.coverURL);
          setCoverState('view');
          Session.set('coverState','view');
        }else{
          setCoverState('hidden');
          Session.set('coverState','hidden');
        }
        */
      }
    })
  });
});

Template.Group.onRendered(function(){
  let groupHandle = Template.instance().templateDictionary.get( 'handle' );
});

Template.Group.events({
  'click #create-post': function(event,template){
    event.preventDefault();
    let group = Template.instance().templateDictionary.get( 'group' );
    if(group){
      let message = template.find('#post-message').value
      let post = {
        userId: Meteor.userId(),
        feedId: group._id,
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

  },
});

Template.Group.helpers({
	interestsCount: function(){
    //communityId = Template.instance().templateDictionary.get( 'communityId' );
    return 0;
  },
  interests: function(){
    return null;
  },
  membersCount: function(){
    return 0;
  },
  groupFeed: function(){
    return null;
  },
  groupPic: function(){
    let group = Template.instance().templateDictionary.get( 'group' );
    console.log(group);
    return null;
  },
  thisUser: function(){
    return Meteor.userId();
  },
  groupName: function(){
    let group = Template.instance().templateDictionary.get( 'group' );
    if(group){
      console.log("groupName: " + group.name);
      return group.name;
    }

  },
  groupHandle: function(){
    let group = Template.instance().templateDictionary.get( 'group' );
    if(group){
      console.log("groupHandle: " + group.handle);
      return group.handle;
    }
  },
  groupFeed: function(){
    let group = Template.instance().templateDictionary.get('group');
    console.log(group);
    if(group){
      if(typeof(group._id) !== 'undefined'){
        console.log(group._id);
        let posts = Posts.find({"feedId":group._id}, {sort: {createdAt: -1}});
        console.log(posts.count())
      	return posts;
      }
    }else{
      console.log("group undefinied");
    }

  },
  membersCount: function(){
    let group = Template.instance().templateDictionary.get('group');
    if(group){
      if(typeof(group.members) !== 'undefined'){
        let members = group.members;
        console.log(members);
        return members.length;
      }
    }
    return 0;
  },
  followingCount: function(){
    return 0;
  },
  members: function(){
    let group = Template.instance().templateDictionary.get('group');
    if(group){
      return group.members;
      /*
      if(typeof(group.members) !== 'undefined'){
        return group.members;
      }
      */
    }
    return 0;
  },
  userIsAdmin: function(){
    let group = Template.instance().templateDictionary.get('group');
    if(group){
      if(typeof(group.admins) !== 'undefined'){
        let admins = group.admins;
        console.log(admins);
        let userId = Meteor.userId();
        console.log(userId);
        console.log(admins.indexOf(userId));
        if(admins.indexOf(userId)){
          console.log("user is admin");
        }else{
          console.log("user is NOT admin");
        }
      }
    }
    console.log("user is NOT admin");
    return false;
  }
});

export function getGroup(){
  console.log('getGroup called');
  var handle = FlowRouter.getParam("handle");
  console.log('handle: ' + handle);
  if(handle){
    let group = Groups.findOne({handle: handle})
    console.log('group: ' + group);
    return group;
  }else{
    Bert.alert('no handle','danger');
  }
}
