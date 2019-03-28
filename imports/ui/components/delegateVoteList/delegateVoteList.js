import './delegateVoteList.html'
import { userProfilePhoto} from '../../../utils/users'
import { Ranks } from '../../../api/ranking/Ranks.js'
import { DelegateVotes } from '../../../api/delegateVotes/DelegateVotes.js'

Template.delegateVoteList.onCreated(function(){
	self = this;
	self.delegates = new ReactiveVar([]);
	self.proposalId = Template.currentData().proposalId;
		self.autorun(function(){
			self.subscribe('delegateVotes.forUserProposal',self.proposalId);
			self.subscribe('ranks.currentUser',LocalStore.get('communityId'));
			self.subscribe('users.currentUsersDelegates',LocalStore.get('communityId'));
		});
});

Template.delegateVoteList.helpers({
	delegateVote: function(vote){
		let delegateVotesFor = DelegateVotes.find({"proposalId":Template.currentData().proposalId,"vote":vote});
    return delegateVotesFor;
  }
});

Template.delegateVoteListItem.helpers({
	getRanking: function(userId) {
    communityId = LocalStore.get('communityId');
    result = Ranks.findOne({entityType: 'delegate', entityId: userId, supporterId: Meteor.userId()});
    if(result){
      return "#" + result.ranking;
    }
  },
  userPhoto: function(userId){
    let userPhoto = userProfilePhoto(userId);
		return userPhoto;
  },
	userFullname: function(userId){
		let user = Meteor.users.findOne({"_id":userId});
		let name = "";
		if(user){
			if(typeof user.profile !== undefined){
				if(typeof user.profile.firstName !== undefined){
					name = user.profile.firstName;
				}
				if(typeof profile.lastName !== undefined){
					name = name + user.profile.lastName;
				}
			}
		}
		return name;
  },
	userProfilename: function(userId){
		let user = Meteor.users.findOne({"_id":userId});
		if(user){
			if(typeof user.profile !== undefined){
				let profile = user.profile;
				if(typeof profile.username !== undefined){
					return profile.username;
				}
			}
		}
  },
	highestRank: function(userId){
		let result = Ranks.findOne({entityType: 'delegate', 'entityId': userId, 'supporterId': Meteor.userId()});

		let highestRank = highestRankedDelegate(Template.currentData().proposalId);
		console.log(highestRank);
		if(result && highestRank){
			if((typeof result.ranking !== undefined)&&(typeof result.ranking !== undefined)){
				console.log("current user: " + result.entityId + " - " + result.ranking);
				console.log("highest ranked user: " + highestRank.entityId + " - " + highestRank.ranking);
				if(highestRank.ranking==result.ranking){
					return "selected";
				}
			}
		}

	}
});

function highestRankedDelegate(proposalId){
	//get all delegates sorted by rank desc
	let highestRank = Ranks.find({"supporterId":Meteor.userId()},{sort:{"ranking":-1}});
	let delegate = {id:false,ranking:false};
	//loop through ranks and check if delegate has voted, last match gets returned.
	highestRank.forEach(function(item){
		if(typeof item.entityId !== undefined){
			let delegateVoteCount = DelegateVotes.find({delegateId: item.entityId,proposalId:proposalId}).count()
			if(delegateVoteCount>0){
				//delegateId = item.entityId;
				delegate.id = item.entityId;
				delegate.ranking = item.ranking;
			}
		}
	});
	return delegate;
}
