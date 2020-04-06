import './data.html';
import RavenClient from 'raven-js';
import {createTestCommunities} from '../../../../utils/test-data/test-communities.js'
import { Communities } from '../../../../api/communities/Communities.js'
import {getCurrentCommunity,getChildCommunities} from '../../../../utils/community.js';

Template.AdminData_TabContent.helpers({
  communityCount: function(){
    return getChildCommunities().count();
  },
});
Template.AdminData_TabContent.events({
  'click #generate-communities': function(event,template){
    event.preventDefault();
    console.log(createTestCommunities());
  },
});
