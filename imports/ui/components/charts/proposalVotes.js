import "./proposalVotes.html"
import "./styles.css"
//DELEGATE VOTE PIE CHART

Template.DelegateVotes.onRendered( function() {
	proposalId = FlowRouter.getParam("id");
	var data = {labels: ['Error'],series: [100]};
	Meteor.call('getProposalDelegateVotes', proposalId, function(error, result){
	    if (error){
	      Bert.alert(error.reason, 'danger');
	    } else {
	      //self.delegateVote.set(result);
	      if(result.length == 1){
	      	data = {
					labels: ['Yes (' + result[0].yesCount + ')', 'No ('+result[0].noCount+')'],
				  	series: [result[0].yesCount,result[0].noCount]
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

			new Chartist.Pie('.ct-chart-delegates', data, options, responsiveOptions);
	      }
	    }
	  })


});

Template.DelegateVotes.onCreated(function () {});

Template.DelegateVotes.helpers({});

Template.DelegateVotes.events({});

//INDIVIDUAL VOTE PIE CHART

Template.IndividualVotes.onRendered( function() {
	proposalId = FlowRouter.getParam("id");
	var data = {labels: ['Error'],series: [100]};
	Meteor.call('getProposalIndividualVotes', proposalId, function(error, result){
	    if (error){
	      Bert.alert(error.reason, 'danger');
	    } else {
	      //self.delegateVote.set(result);
	      if(result.length == 1){
	      	data = {
					labels: ['Yes (' + result[0].yesCount + ')', 'No ('+result[0].noCount+')'],
				  	series: [result[0].yesCount,result[0].noCount]
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

			new Chartist.Pie('.ct-chart-individuals', data, options, responsiveOptions);
	      }
	    }
	  })


});

Template.IndividualVotes.onCreated(function () {});

Template.IndividualVotes.helpers({});

Template.IndividualVotes.events({});

//DELEGATE VOTE BAR
Template.DelegateVoteBar.onCreated(function () {
	var self = this;
	self.propertiesSet = new ReactiveVar(true);
	self.showTotals = new ReactiveVar(false);
	self.proposalId = new ReactiveVar(null);
});
Template.DelegateVoteBar.onRendered( function() {
	var id = $("#delegateVoteBar").data("proposal-id");

	if(id){
		Template.instance().proposalId.set(id)
		Meteor.call('getProposalDelegateVotes', id, function(error, result){
			if (error){
		      Bert.alert(error.reason, 'danger');
		    } else {
		      if(result.length == 1){
		      	percent = yesNoPercent(result[0].yesCount,result[0].noCount);
		      	$('div#delegateYesBar').width(percent.yes);
				$('div#delegateNoBar').width(percent.no);
				Template.instance().propertiesSet.set(true);
			  }
			}
		});
	}

});

Template.DelegateVoteBar.helpers({
	propertiesSet() {
		return Template.instance().propertiesSet.get();
	},
	yesTotals(){
		return "yesTotal";
	},
	noTotals(){
		return "noTotal";
	}
});
Template.DelegateVoteBar.events({});
//INDIVIDUAL VOTE BAR
Template.IndividualVoteBar.onCreated(function () {
	var self = this;
	self.propertiesSet = new ReactiveVar(true);
	self.showTotals = new ReactiveVar(false);
	self.proposalId = new ReactiveVar(null);
});
Template.IndividualVoteBar.onRendered( function() {
	var id = $("#individualVoteBar").data("proposal-id");

	if(id){
		Template.instance().proposalId.set(id)
		Meteor.call('getProposalDelegateVotes', id, function(error, result){
			if (error){
		      Bert.alert(error.reason, 'danger');
		    } else {
		      if(result.length == 1){
		      	percent = yesNoPercent(result[0].yesCount,result[0].noCount);
		      	$('div#individualYesBar').width(percent.yes);
				$('div#individualNoBar').width(percent.no);
				Template.instance().propertiesSet.set(true);
			  }
			}
		});
	}

});

Template.IndividualVoteBar.helpers({
	propertiesSet() {
		return Template.instance().propertiesSet.get();
	},
	yesTotals(){
		return "yesTotal";
	},
	noTotals(){
		return "noTotal";
	}
});
/*
Template.DelegateVotes.onRendered( function() {});
Template.DelegateVotes.onCreated(function () {});
Template.DelegateVotes.helpers({});
Template.DelegateVotes.events({});
*/

function yesNoPercent(yesCount,noCount){
	var total = yesCount + noCount;
	yesPercent = Math.round(yesCount * 100 / total);
	noPercent = Math.round(noCount * 100 / total);
	var result = {"yes":yesPercent + "%","no":noPercent+"%"};
	return result;
}
