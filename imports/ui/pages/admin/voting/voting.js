import './voting.html';
import { Proposals } from '../../../../api/proposals/Proposals.js'
import { Votes } from '../../../../api/votes/Votes.js'
import RavenClient from 'raven-js';

Template.AdminVoting.onCreated(function() {
  var self = this;
  self.tallyInProgress = new ReactiveVar(false);
  var communityId = LocalStore.get('communityId');
  self.autorun(function() {
    self.subscribe('proposals.public', communityId);
    self.subscribe('votes.all');
  });
});

Template.AdminVoting.helpers({
  proposals: function() {
  	// only display expired proposals that are public
  	return Proposals.find({stage: "live"}, {sort: {endDate: -1}});
  },
  tallyInProgress: function(){
  	return Template.instance().tallyInProgress.get();
  },
  yesCount: function(proposalId) {
  	return Votes.find({proposalId: proposalId, vote: 'yes'}).count();
  },
  noCount: function(proposalId) {
  	return Votes.find({proposalId: proposalId, vote: 'no'}).count();
  },
  voteCount: function(proposalId) {
  	return Votes.find({proposalId: proposalId}).count();
  },
  endDateFormatted: function(endDate){
	   return moment(endDate).format('DD MMMM YYYY');
  },
  author: function(id){
  var author = Meteor.users.findOne({ _id : id});
    if(typeof author!=='undefined'){
      if(author.profile.firstName==null){
        return author.profile.username;
      }
      return author.profile.firstName + " " + author.profile.lastName + " (" + author.profile.username + ")";
    }
    return "error finding name";
  },
  title: function(proposal) {
    var language = TAPi18n.getLanguage();
    var translation = _.find(proposal.content, function(item){ return item.language == language});
    if (translation) {
      var title = translation.title;
      if (title && /\S/.test(title)) {
        return title;
      } else {
        return TAPi18n.__('pages.proposals.list.untitled')
      }
    } else {
      return TAPi18n.__('pages.proposals.list.untranslated')
    }
  },
});

Template.AdminVoting.events({

	'click .tally-votes-button': function(event, template){
		proposalId = event.target.dataset.proposalId;
		template.tallyInProgress.set(true);
		Meteor.call('prepareVotesForTally', [proposalId], function(error){
			if (error){
        RavenClient.captureException(error);
				Bert.alert(error.reason, 'danger');
			}
			template.tallyInProgress.set(false);
		});

	},
});
