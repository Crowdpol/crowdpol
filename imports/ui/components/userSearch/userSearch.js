import "./userSearch.html";
import "./styles.css"

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
    addUser($(e.currentTarget).attr("data-user-id"));
    $("#autosuggest-results").hide();
  },
  'blur #invited': function(e,t) {
    $("#autosuggest-results").hide();
  },
  'focus #invited': function(e,t) {
    ($('#invited').val().length) ? $("#autosuggest-results").show() : $("#autosuggest-results").hide();
  },
  'keyup #invited': function(event, template) {
    ($('#invited').val().length) ? $("#autosuggest-results").show() : $("#autosuggest-results").hide();

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
      $("#autosuggest-results").hide();
    }
    if(key == 13 || key == 9){
      var selectedIndex = $('#autosuggest-results li.selected').index();
      if(selectedIndex > -1){
        addUser(listItems[selectedIndex].getAttribute('data-user-id'))

      }else{
        if(validateEmail($('#invited').val())){
          emails = Session.get('emailInvites');
          emails.push($('#invited').val())
          Session.set('emailInvites',emails);
          $('#invited').val('');
        }
      }
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
    console.log(result);
    return result;
  }
});

function addUser(id){
        invited = Session.get("invited");
        invited.push(id);
        Session.set("invited",invited);
        $('#invited').val('');
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
