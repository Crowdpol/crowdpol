SyncedCron.add({
  name: 'Prepare Expired Proposals for Tally',
  schedule: function(parser) {
    // parser is a later.parse object
    return parser.recur().on('00:05:00').time();

  },
  job: function() {
    console.log('jobbing')
    var proposalIds = Meteor.call('findExpiredProposals');
    Meteor.call('prepareVotesForTally', proposalIds);
  }
});

SyncedCron.start();