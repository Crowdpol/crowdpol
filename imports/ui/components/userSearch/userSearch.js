import "./userSearch.html";
import "./styles.css"
import { getTotalInvites } from '../../pages/proposals/editProposal.js'

Template.UserSearch.onCreated(function() {
  Session.set('searchPhrase', '');
  var self = this;
  var communityId = LocalStore.get('communityId');
  self.autorun(function() {
    self.subscribe("userSearch", Session.get('searchPhrase'), communityId);
  });
});

Template.UserSearch.events({
  'mouseleave .autosuggest-suggestion': function(e,t){
    $(e.currentTarget).removeClass("selected");
  },
  'mouseover .autosuggest-suggestion': function(e,t){
    $(e.currentTarget).addClass("selected");
  },
  'mousedown .autosuggest-suggestion': function(e,t){
    if(canAdd()){
      addUser($(e.currentTarget).attr("data-user-id"));
    }
    $("#autosuggest-results").hide();
  },
  'blur #invited': function(e,t) {
    $("#autosuggest-results").hide();
  },
  'focus #invited': function(e,t) {
    //$("#autosuggest-results").show();
    ($('#invited').val().length) ? $("#autosuggest-results").show() : $("#autosuggest-results").hide();
  },
  'keyup #invited': function(event, template) {
    if($('#invited').val().length){
      $("#autosuggest-results").show();
    }else{
      $("#autosuggest-results").hide();
    }

    var key = event.keyCode;
    var list = document.querySelector("#autosuggest-results");
    var listItems = document.getElementById("autosuggest-results").getElementsByTagName("li");

    // down (40), up (38)
    if ((key == 40 || key == 38) && list.innerHTML) {
      var selectedIndex = $('#autosuggest-results li.selected').index();
      if((key == 40)&&((selectedIndex+1)==listItems.length)||(key == 38)&&(selectedIndex==0)){
        return false;
      }
      if(listItems.length = 1){
        listItems[0].className += ' selected';
      }
      if (selectedIndex == -1) {
        next = (key == 40) ? listItems[0]: listItems[listItems.length - 1]; // first : last
        next.className += ' selected';
      }else{
        next = (key == 40) ? listItems[selectedIndex+1]: listItems[selectedIndex - 1]; // first : last
        $('#autosuggest-results li.selected').toggleClass("selected")
        next.className += ' selected';
      }
      if (selectedIndex == listItems[listItems.length - 1]) {
      }
    }
    if(key == 27){
      //$("#autosuggest-results").hide();
    }
    if(key == 13 || key == 9){
      var selectedIndex = $('#autosuggest-results li.selected').index();
      if(canAdd()){
        console.log("true");
      }else{
        console.log("false");
      }
      if(selectedIndex > -1){
        if(canAdd()){
          addUser(listItems[selectedIndex].getAttribute('data-user-id'))
        }
      }else{
        if(validateEmail($('#invited').val())&&canAdd()){
          addEmail($('#invited').val());
        }
      }
      $("#autosuggest-results").hide();
    }
    Session.set('searchPhrase', event.currentTarget.value);
  }
});

Template.UserSearch.helpers({
  userMatches: function() {
   result = Meteor.users.find({ $and: [
      { _id : { $nin : Session.get('invited')}},
      { _id : { $ne: Meteor.userId()} }
    ]}).fetch();
    //console.log(result);
    return result;
    //return getUserSearch(Session.get('searchPhrase'), LocalStore.get('communityId'),Session.get('invited'));
  }
});

function addUser(id){
  //get existing invited ids
  invited = Session.get("invited");
  invited.push(id);
  Session.set("invited",invited);
  $('#invited').val('');
}
function addEmail(email){
  emails = Session.get('emailInvites');
  emails.push(email);
  Session.set('emailInvites',emails);
  $('#invited').val('');
}

function canAdd(){
  let settings = LocalStore.get('settings');
  let maxCount = -1;
  if(typeof settings != 'undefined'){
    if(typeof settings.collaboratorLimit != 'undefined'){
      maxCount = settings.collaboratorLimit;
    }
  }
  //if 0, then disabled
  if(maxCount==0){
    Bert.alert('Collaborator invite disabled by system administrator', 'danger');
    return false;
  }
  //if -1 then unlimited
  if(maxCount==-1){
    return true;
  }
  let invitedCount = getTotalInvites();
  if(invitedCount<maxCount){
    return true;
  }
  Bert.alert(TAPi18n.__("pages.proposals.edit.alerts.collaborator-limit-exceeded",{limit:maxCount}),'danger');
  return false;
}

function validateEmail(mail){
 if (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(mail))
  {
    return (true)
  }
    Bert.alert({
      title: TAPi18n.__('pages.proposals.edit.alerts.bad-email'),
      type: 'danger',
      style: 'growl-bottom-right',
      icon: 'fa-exclamation-triangle'
    });
    return (false)
}
