import { Meteor } from 'meteor/meteor';
import { Proposals } from '../Proposals.js';
import { buildAggregator } from 'meteor/lamoglia:publish-aggregation';

const pipelineCreator = () => ([
		{ $unwind : "$content" },
		{ $match: 
			{
				communityId: "whz9Ep4Ptqv3EFbqE",
				"content.language" : "sv",
				stage: "live"
			}
		},
]);

Meteor.publish('proposals.sort', buildAggregator(Proposals, pipelineCreator));


Meteor.publish('proposals.community', function(communityId) {
	return Proposals.find({communityId: communityId});
});

Meteor.publish('proposals.one', function(id) {
	return Proposals.find({_id: id});
});

//Proposals that are live and open to the public
Meteor.publish('proposals.public', function(search, communityId) {
	let query = generateSearchQuery(search, communityId);
	query.stage = 'live';
	return Proposals.find(query);
});

//Proposals that are live and open to the public
Meteor.publish('proposals.public.stats', function(search, communityId) {
	let query = generateSearchQuery(search, communityId);
	query.stage = 'live';
	//return Proposals.find(query);
	var self = this;
	   Proposals
	        .find( query)
	        //loop through each match and add the ranking to the user object
	        .forEach(function(proposal) {
	            individualVotes = Meteor.call('getProposalIndividualVotes', proposal._id);
	            delegateVotes = Meteor.call('getProposalDelegateVotes', proposal._id);
	           	//console.log(proposal._id);
	            //console.log(individualVotes);
	            //console.log(delegateVotes);
	            
	            proposal["individualVotes"] = yesNoResults(individualVotes[0]);
	            proposal["delegateVotes"] = yesNoResults(delegateVotes[0]);
	            self.added("proposals", proposal._id, proposal);
	        });
	    self.ready();
	});

//Proposals that the user authored
Meteor.publish('proposals.author', function(search, communityId) {
	check(search, Match.OneOf(String, null, undefined));
	check(communityId, String);
	let query = generateSearchQuery(search, communityId);
	query.authorId = this.userId;
	return Proposals.find(query);
});

//Proposals that the user is invited to collaborate on
Meteor.publish('proposals.invited', function(search, communityId) {
	let query = generateSearchQuery(search, communityId);
	query.invited = this.userId;
	return Proposals.find(query);
});

Meteor.publish('proposals.withTag', function (keyword, communityId) {
  var tag = Meteor.call('getTagByKeyword', keyword)
  if (tag){
    return Proposals.find({tags: { $elemMatch: {_id: tag._id}}});
  }
});

function generateSearchQuery(searchTerm, communityId){
	check(searchTerm, Match.OneOf(String, null, undefined));
	check(communityId, String);
	let query = {}
	query.communityId = communityId;

	if (searchTerm) {
		let regex = new RegExp(searchTerm, 'i');

		query = {
			$and: [
			{
				communityId: communityId
			},
			{$or: [
				{ 'content.title': regex },
				{ 'content.abstract': regex },
				{ 'content.body': regex }
				]}
			]
			
			};
	}
	return query;
}
function yesNoResults(theseVotes){
	var total = theseVotes.yesCount + theseVotes.noCount;
	result = { 
		"totalVotes":total,
		"yesCount":theseVotes.yesCount,
		"noCount":theseVotes.noCount,
		"yesPercent":Math.round(theseVotes.yesCount * 100 / total),
		"noPercent":Math.round(theseVotes.noCount * 100 / total)
	};
	return result;
}