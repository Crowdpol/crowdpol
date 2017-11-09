import './viewProposal.html'

Template.ViewProposal.onCreated(function(){
    var proposalId = FlowRouter.getParam("id");
    /*self.subscribe('proposals.one', proposalId)
    proposal = Meteor.call('getProposal', proposalId);    
    console.log(proposal)*/
  var dict = new ReactiveDict();

  Meteor.call('getProposal',proposalId,function(error,result){
    if (error){
      Bert.alert(error.reason, 'danger');
    }else{
      console.log('here comes the proposal sonny==================')
      console.log(result)
      dict.set( 'title', result.title );
      dict.set( 'abstract', result.abstract );
      dict.set( 'body', result.body );
      dict.set( 'startDate', moment(result.startDate).format('YYYY-MM-DD') );
      dict.set( 'endDate', moment(result.endDate).format('YYYY-MM-DD') );
      dict.set( 'invited', result.invited );
      dict.set( 'authorId', result.authorId );
      dict.set( 'stage', result.stage );
      console.log(dict)
    }
  });
  this.templateDictionary = dict;
});

Template.ViewProposal.events({
  'submit form' (event, template){
  }
});

Template.ViewProposal.helpers({

  title: function() {
    return Template.instance().templateDictionary.get( 'title' );
  },
  abstract: function() {
    return Template.instance().templateDictionary.get( 'abstract' );
  },
  body: function() {
    return Template.instance().templateDictionary.get( 'body' );
  },
  startDate: function() {
    return Template.instance().templateDictionary.get( 'startDate' );
  },
  endDate: function() {
    return Template.instance().templateDictionary.get( 'endDate' );
  },
  isInvited: function() {
    return userIsInvited();
  },
  isAuthor: function() {
    return userIsAuthor();
  },
  isLive: function() {
    return proposalIsLive();
  },
  isVisible: function() {
    // Proposal should be visible t everyone if live, 
    //or if not live, to authors and invited users
    if (proposalIsLive() || userIsAuthor() || userIsInvited()){
      return true;
    } else {
      return false;
    }
  }
});

function userIsAuthor(){
  if (Meteor.userId() == Template.instance().templateDictionary.get( 'authorId' )){
      return true;
    } else {
      return false;
    }
}

function userIsInvited(){
  // If the user is the author, they have all the same access rights as contributors
  if (userIsAuthor()){
    return true;
  } else {
    invited = Template.instance().templateDictionary.get( 'invited' );
    for (i=0; i<invited.length; i++){
      if (Meteor.userId() == invited[i]) {
        return true;
      }
    }
    return false;
  }
}

function proposalIsLive(){
  if (Template.instance().templateDictionary.get( 'stage' ) == 'live'){
      return true;
    } else {
      return false;
    }
}

