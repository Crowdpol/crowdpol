import "../../../components/charts/proposalVotes.js"
import "./proposalStats.html"
import "./styles.css"

Template.ProposalStatsPage.onCreated(function(){
	var self = this;
	proposalId = FlowRouter.getParam("id");
	var dict = new ReactiveDict();

	Meteor.call('getProposal',proposalId,function(error,result){
	    if (error){
	      Bert.alert(error.reason, 'danger');
	    }else{
	      dict.set( 'title', result.title );
	      dict.set( 'abstract', result.abstract );
	      dict.set( 'body', result.body );
	      dict.set( 'startDate', moment(result.startDate).format('YYYY-MM-DD') );
	      dict.set( 'endDate', moment(result.endDate).format('YYYY-MM-DD') );
	      dict.set( 'invited', result.invited );
	      dict.set( 'authorId', result.authorId );
	      dict.set( 'stage', result.stage );
	      dict.set( 'status', result.status );
	      dict.set( 'tags', result.tags );
	      dict.set( 'pointsFor', result.pointsFor );
	      dict.set( 'pointsAgainst', result.pointsAgainst );
	    }
	});
	this.templateDictionary = dict;
});

Template.ProposalStatsPage.helpers({
  title: function() {
    return Template.instance().templateDictionary.get( 'title' );
  },
  tags: function() {
    return Template.instance().templateDictionary.get( 'tags' );
  },
  abstract: function() {
    return Template.instance().templateDictionary.get( 'abstract' );
  },
  body: function() {
    return Template.instance().templateDictionary.get( 'body' );
  },
  status: function() {
    return Template.instance().templateDictionary.get( 'status' );
  },
  startDate: function() {
    return Template.instance().templateDictionary.get( 'startDate' );
  },
  endDate: function() {
    return Template.instance().templateDictionary.get( 'endDate' );
  },
  pointsFor: function() {
    return Template.instance().templateDictionary.get( 'pointsFor' );
  },
  pointsAgainst: function() {
    return Template.instance().templateDictionary.get( 'pointsAgainst' );
  }
});

Template.ProposalStatsPage.events({
  'click #showHideButton' (event, template){
  	//$("#hidden-content").toggleClass("hidden");
  	$("#hidden-content").slideToggle(function (){
        $("#showHideIcon").text("keyboard_arrow_down")
        .stop();
    }, function(){
        $("#showHideIcon").text("keyboard_arrow_up")
        .stop();
    });
  }
});
