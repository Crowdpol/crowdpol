import "./proposalVotes.html"

Template.DelegateVotes.onRendered( function() {
	proposalId = FlowRouter.getParam("id");
	console.log(proposalId);
	Meteor.call('getAllDelegateVotes', proposalId, function(error, result){
	    if (error){
	      Bert.alert(error.reason, 'danger');
	    } else {
	      //self.delegateVote.set(result);
	      console.log(result);
	    }
	  })
	var data = {
		labels: ['Yes', 'No'],
	  	series: [200,150]
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

Template.DelegateVotes.onCreated(function () {});

Template.DelegateVotes.helpers({});

Template.DelegateVotes.events({});

/*
Template.DelegateVotes.onRendered( function() {});
Template.DelegateVotes.onCreated(function () {});
Template.DelegateVotes.helpers({});
Template.DelegateVotes.events({});
*/