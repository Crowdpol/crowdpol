import { Proposals } from '../../../api/proposals/Proposals.js'
import "./stats.html"

Template.Stats.onRendered( function() {
	console.log("stats rendered");
	
});



Template.ProposalStatsCard.onRendered( function() {
	//['draft', 'submitted', 'live']
	//'unreviewed', 'approved', 'rejected'
	//Get 4 amounts:
	//1. count of proposals that have been "stage" : "draft", "status" : "unreviewed"
	//2. count where "stage" : "live","status" : "approved"
	//3. "stage" : "submitted", "status" : "unreviewed"
	var data = {
		labels: ['Bananas', 'Apples', 'Grapes'],
	  series: [5, 3, 4]
	};

	var options = {
	  labelInterpolationFnc: function(value) {
	    return value[0]
	  }
	};

	var responsiveOptions = [
	  ['screen and (min-width: 640px)', {
	    chartPadding: 30,
	    labelOffset: 100,
	    labelDirection: 'explode',
	    labelInterpolationFnc: function(value) {
	      return value;
	    }
	  }],
	  ['screen and (min-width: 1024px)', {
	    labelOffset: 80,
	    chartPadding: 20
	  }]
	];

	new Chartist.Pie('.ct-chart', data, options);
});

Template.ProposalStats.onRendered( function() {
	//['draft', 'submitted', 'live']
	//'unreviewed', 'approved', 'rejected'
	//Get 4 amounts:
	//1. count of proposals that have been "stage" : "draft", "status" : "unreviewed"
	//2. count where "stage" : "live","status" : "approved"
	//3. "stage" : "submitted", "status" : "unreviewed"
	var data = {
		labels: ['Bananas', 'Apples', 'Grapes'],
	  series: [5, 3, 4]
	};

	var options = {
	  labelInterpolationFnc: function(value) {
	    return value[0]
	  }
	};

	var responsiveOptions = [
	  ['screen and (min-width: 640px)', {
	    chartPadding: 30,
	    labelOffset: 100,
	    labelDirection: 'explode',
	    labelInterpolationFnc: function(value) {
	      return value;
	    }
	  }],
	  ['screen and (min-width: 1024px)', {
	    labelOffset: 80,
	    chartPadding: 20
	  }]
	];

	new Chartist.Pie('.ct-chart', data, options, responsiveOptions);
});

Template.ProposalStats.onCreated(function () {
  var self = this;

  self.searchQuery = new ReactiveVar();
  self.openProposals = new ReactiveVar(true);

  self.autorun(function(){
    self.subscribe('proposals.public', self.searchQuery.get());
  })
});

Template.ProposalStats.helpers({
  searching() {
    return Template.instance().searching.get();
  },
  query() {
    return Template.instance().searchQuery.get();
  },
  closedProposals: function() {
    return Proposals.find({endDate:{"$lte": new Date()}, stage: "live"}, {transform: transformProposal, sort: {endDate: -1}});
  },
  openProposals: function() {
    return Proposals.find({endDate:{"$gte": new Date()}, stage: "live"}, {transform: transformProposal, sort: {endDate: -1}});
  },
  openSelected: function(){
    return Template.instance().openProposals.get();
  },
 });

function transformProposal(proposal) { 
  proposal.endDate = moment(proposal.endDate).format('YYYY-MM-DD');;
  return proposal;
};

Template.ProposalStats.events({
  'click #open-closed-switch': function(event, template){
    Template.instance().openProposals.set(event.target.checked);
  }
});

Template.ProposalStatsPage.onRendered( function() {
	proposalId = FlowRouter.getParam("id");
	console.log(proposalId);

});