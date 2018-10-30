SyncedCron.add({
  name: 'Prepare Expired Proposals for Tally',
  schedule: function(parser) {
    // parser is a later.parse object
    return parser.recur().on('00:05:00').time();

  },
  job: function() {
    var proposalIds = Meteor.call('findProposalsForCronJob');
    Meteor.call('prepareVotesForTally', proposalIds);
  }
});

SyncedCron.start();
