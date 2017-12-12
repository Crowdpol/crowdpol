import { Proposals } from '../../../../api/proposals/Proposals.js'
import { getProposalsPublishedStats } from '/imports/api/proposals/methods.js';
import "./stats.html"
import "./styles.css"
import "./proposalStats.js"

Template.Stats.onRendered(function() {
  console.log("stats rendered");

});



Template.ProposalStatsCard.onRendered(function() {
  new Chartist.Line('.ct-chart-preview', {
    labels: [1, 2, 3, 4, 5, 6, 7, 8],
    series: [
      [1, 2, 3, 1, -2, 0, 1, 0],
      [-2, -1, -2, -1, -3, -1, -2, -1],
      [0, 0, 0, 1, 2, 3, 2, 1],
      [3, 2, 1, 0.5, 1, 0, -1, -3]
    ]
  }, {
    high: 3,
    low: -3,
    fullWidth: true,
    // As this is axis specific we need to tell Chartist to use whole numbers only on the concerned axis
    axisY: {
      onlyInteger: true,
      offset: 20
    }
  });
});

Template.ProposalStats.onRendered(function() {
  //['draft', 'submitted', 'live']
  //'unreviewed', 'approved', 'rejected'
  //Get 4 amounts:
  //1. count of proposals that have been "stage" : "draft", "status" : "unreviewed"
  //2. count where "stage" : "live","status" : "approved"
  //3. "stage" : "submitted", "status" : "unreviewed"
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
      labelOffset: 0,
      chartPadding: 0,

    }]
  ];
  //Loads the data for the graphs
  Meteor.call('getProposalsPublishedStats', function(error, result) {
    if (error) {
      Bert.alert(error.reason, 'danger');
    } else {
      if (result != undefined) {
        if (result.length >= 1) {
          console.log("this is from rendered");
          console.log(result);
          var overviewData = {
            labels: ['Draft', 'Submitted', 'Live'],
            series: [
              (result[0].draftUnreviewedCount + result[0].draftApprovedCount + result[0].draftRejectedCount),
              (result[0].submittedReviewedCount + result[0].submittedApprovedCount + result[0].submittedRejectedCount),
              (result[0].liveUnreviewedCount + result[0].liveApprovedCount + result[0].liveRejectedCount)
            ]
          };
          var draftData = {
            labels: ['Unreviewed', 'Approved', 'Rejected'],
            series: [
              result[0].draftUnreviewedCount,
              result[0].draftApprovedCount,
              result[0].draftRejectedCount,
            ]
          };
          var submittedData = {
            labels: ['Reviewed', 'Approved', 'Rejected'],
            series: [
              result[0].submittedReviewedCount,
              result[0].submittedApprovedCount,
              result[0].submittedRejectedCount,
            ]
          };
          var liveData = {
            labels: ['Unreviewed', 'Approved', 'Rejected'],
            series: [
              result[0].liveUnreviewedCount,
              result[0].liveApprovedCount,
              result[0].liveRejectedCount
            ]
          };
          new Chartist.Pie('.ct-chart-overview', overviewData, options, responsiveOptions);
          new Chartist.Pie('.ct-chart-draft-overview', draftData, options, responsiveOptions);
          new Chartist.Pie('.ct-chart-submitted-overview', submittedData, options, responsiveOptions);
          new Chartist.Pie('.ct-chart-live-overview', liveData, options, responsiveOptions);
          console.log("made it");
        }
      } else {
        Bert.alert("No result returned from server", 'danger');
      };

    }
  });
});

Template.ProposalStats.onCreated(function() {
	//Another futile attempt at loading data from a method call that can interact with responsive variables
	// this is the reasoning I was following from the Meteor documentation: https://guide.meteor.com/methods.html#loading-data
  //ProposalStats = new Mongo.Collection(null);
  //updateStats();
  var self = this;
  var dict = new ReactiveDict();
  /*
  dict.set( 'methodSuccess',false);
  dict.set( 'draftUnreviewedCount', 0);
	dict.set( 'draftApprovedCount',0);
	dict.set( 'draftRejectedCount',0);
	dict.set( 'submittedReviewedCount',0);
	dict.set( 'submittedApprovedCount',0);
	dict.set( 'submittedRejectedCount',0);
	dict.set( 'liveUnreviewedCount',0);
	dict.set( 'liveApprovedCount',0);
	dict.set( 'liveRejectedCount',0);
	*/
  self.openProposals = new ReactiveVar(true);

  self.autorun(function() {
    self.subscribe('proposals.public.stats');
  });
  Tracker.autorun(() => {
    Meteor.call('getProposalsPublishedStats', function(error, result) {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        if (result != undefined) {
          if (result.length >= 1) {
          	//this is not working for some incredibly frustrating reason. 
            dict.set('methodSuccess', true);
            dict.set('draftUnreviewedCount', result[0].draftUnreviewedCount);
            dict.set('draftApprovedCount', result[0].draftApprovedCount);
            dict.set('draftRejectedCount', result[0].draftRejectedCount);
            dict.set('submittedReviewedCount', result[0].submittedReviewedCount);
            dict.set('submittedApprovedCount', result[0].submittedApprovedCount);
            dict.set('submittedRejectedCount', result[0].submittedRejectedCount);
            dict.set('liveUnreviewedCount', result[0].liveUnreviewedCount);
            dict.set('liveApprovedCount', result[0].liveApprovedCount);
            dict.set('liveRejectedCount', result[0].liveRejectedCount);
          }
        }
      }
    });
    this.templateDictionary = dict;
  });
});

Template.ProposalStats.helpers({
  searching() {
    return Template.instance().searching.get();
  },
  query() {
    return Template.instance().searchQuery.get();
  },
  closedProposals: function() {
    return Proposals.find({ endDate: { "$lte": new Date() }, stage: "live" }, { transform: transformProposal, sort: { endDate: -1 } });
  },
  openProposals: function() {
    result = Proposals.find({ endDate: { "$gte": new Date() }, stage: "live" }, { transform: transformProposal, sort: { endDate: -1 } });
    console.log(result);
    return result;
  },
  openSelected: function() {
    return Template.instance().openProposals.get();
  },
  methodSuccess() {
    return Template.instance().methodSuccess.get();
  },
  draftUnreviewedCount() {
    return Template.instance().draftUnreviewedCount.get();
  },
  draftApprovedCount() {
    return Template.instance().draftApprovedCount.get();
  },
  draftRejectedCount() {
    return Template.instance().draftRejectedCount.get();
  },
  submittedReviewedCount() {
    return Template.instance().submittedReviewedCount.get();
  },
  submittedApprovedCount() {
    return Template.instance().submittedApprovedCount.get();
  },
  submittedRejectedCount() {
    return Template.instance().submittedRejectedCount.get();
  },
  liveUnreviewedCount() {
    return Template.instance().liveUnreviewedCount.get();
  },
  liveApprovedCount() {
    return Template.instance().liveApprovedCount.get();
  },
  liveRejectedCount() {
    return Template.instance().liveRejectedCount.get();
  }
});

function transformProposal(proposal) {
  proposal.endDate = moment(proposal.endDate).format('YYYY-MM-DD');;
  return proposal;
};

Template.ProposalStats.events({
  'click #open-closed-switch': function(event, template) {
    Template.instance().openProposals.set(event.target.checked);
  }
});

Template.ProposalCardList.onRendered(function() {
  console.log(this);
});

function updateStats() {
  // Clean out result cache
  ProposalStats.remove({});
  // Call a Method that does an expensive computation
  getProposalsPublishedStats.call((err, res) => {
    res.forEach((item) => {
      ProposalStats.insert(item);
    });
  });

  result = ProposalStats.find();
  console.log(result);
}