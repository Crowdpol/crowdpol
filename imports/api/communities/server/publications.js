import { Meteor } from 'meteor/meteor';
import { Communities } from '../Communities.js';

// on the server

Meteor.publish('communities.all', function() {
  return Communities.find();//{"isArchived":{$ne:true}});
});

Meteor.publish('community', function(id) {
  return Communities.find({_id: id,"isArchived":{$ne:true}});
});

Meteor.publish('communities.subdomain', function(subdomain) {
  return Communities.find({subdomain: subdomain,"isArchived":{$ne:true}});
});

Meteor.publish('communities.children', function(rootCommunity) {
  //console.log("root community: " + rootCommunity);
  //console.log(Communities.find({"parentCommunity":rootCommunity,"isArchived":{$ne:true},"isRoot":false}).count());
  return Communities.find({"parentCommunity":rootCommunity,"isArchived":{$ne:true},"isRoot":false});
});
