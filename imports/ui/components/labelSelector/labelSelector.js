import { Labels } from '/imports/api/labels/Labels.js';
import { Meteor } from 'meteor/meteor';
import './labelSelector.html'

Template.LabelSelector.onCreated(function(){
  var self = this;
  var communityId = LocalStore.get('communityId');
  self.editState = new ReactiveVar(false);
  self.addState = new ReactiveVar(false);
  self.currentLabel = new ReactiveVar();
  self.selectedLabels = new ReactiveVar([]);
  self.labelSearch = new ReactiveVar();
  self.autorun(function() {
    Meteor.subscribe('labels.community', communityId);
    //Meteor.subscribe("labelSearch", self.labelSearch.get(), communityId);
    //disableInputs(true);
  });
});

Template.LabelSelector.onRendered(function(){

});

Template.LabelSelector.events({
  'click .item-text ' (event, template){
    let labelId = event.currentTarget.getAttribute('data-id');
    addLabel(labelId,template);
    event.stopPropagation();
  },
  'click .caret'(event, template){
    $(event.currentTarget).parent(".label-tree-item").children(".nested").toggleClass("active")
    $(event.currentTarget).toggleClass("caret-down");
  },
  'click .delete-parent'(event, template){
    let id = $(event.currentTarget).parent(".mdl-chip").attr("data-id");
    if(id){
      //event.stopPropagation();
      let selectedLabels = template.selectedLabels.get();
      if(selectedLabels.includes(id)){
        var index = selectedLabels.indexOf(id);    // <-- Not supported in <IE9
        if (index !== -1) {
            selectedLabels.splice(index, 1);
        }
        template.selectedLabels.set(selectedLabels);
      }
    }
  },
  'mouseleave .autosuggest-suggestion': function(e,t){
    $(e.currentTarget).removeClass("selected");
  },
  'mouseover .autosuggest-suggestion': function(e,t){
    $(e.currentTarget).addClass("selected");
  },
  'mousedown .autosuggest-suggestion': function(e,t){
    addLabel($(e.currentTarget).attr("data-label-id"),t);
    $('#search-label').val();
    $("#autosuggest-results").hide();
  },
  'blur #search-label': function(e,t) {
    $("#autosuggest-results").hide();
  },
  'focus #search-label': function(e,t) {
    ($('#search-label').val().length) ? $("#autosuggest-results").show() : $("#autosuggest-results").hide();
  },
  'keyup #search-label': function(event, template) {
    ($('#search-label').val().length) ? $("#autosuggest-results").show() : $("#autosuggest-results").hide();

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
      if(canAdd()){
        console.log("true");
      }else{
        console.log("false");
      }
      if(selectedIndex > -1){
        if(canAdd()){
          addUser(listItems[selectedIndex].getAttribute('data-label-id'))
        }
      }else{
        if(validateEmail($('#search-label').val())&&canAdd()){
          addEmail($('#search-label').val());
        }
      }
    }
    Template.instance().labelSearch.set(event.currentTarget.value);
    $('#search-label').val();
  }
});

Template.LabelSelector.helpers({
  labelCount: ()=> {
    return Labels.find({"communityId":LocalStore.get('communityId')}).count();
  },
  selectedLables: ()=>{
    let selectedLabels =  Template.instance().selectedLabels.get();
    return Labels.find({"_id": {$in: selectedLabels},"communityId":LocalStore.get('communityId')});
  },
  rootLabels: ()=> {
    return Labels.find({parentLabels: []});
  },
  hasChildren: (labelId)=>{
    let childCount = Labels.find({parentLabels: labelId}).count();
    if(childCount > 0){
      return true;
    }
    return false;
  },
  parentLabels: ()=>{
    let editState = Template.instance().editState.get();
    if(editState){
      let selectedParents = Template.instance().selectedParents.get();
      return Labels.find({_id: {$in: selectedParents}});
    }else{
      let id = Template.instance().currentLabel.get();
      if(id){
        let selectedLabel = Labels.findOne({_id:id});
        if(typeof selectedLabel.parentLabels != 'undefined'){
          return Labels.find({_id: {$in: selectedLabel.parentLabels}});
        }
      }
    }

  },
  labelMatches: ()=>{
   let search = Template.instance().labelSearch.get();
   let regex = new RegExp( search, 'i' );
   console.log(regex);
   result = Labels.find({$or: [{ "keyword": regex},{ "description": regex}]},{limit: 5});
    //console.log(result);
    return result;
    //return getUserSearch(Session.get('searchPhrase'), LocalStore.get('communityId'),Session.get('invited'));
  }
});

function addLabel(labelId,template){
  console.log("labelId:"+labelId);
  let selectedLabels = template.selectedLabels.get();
  if(!selectedLabels.includes(labelId)){
    selectedLabels.push(labelId);
  }
  template.selectedLabels.set(selectedLabels);
}
