import { Labels } from '/imports/api/labels/Labels.js';
import { Meteor } from 'meteor/meteor';
import "./labels.html";
import RavenClient from 'raven-js';

Template.AdminLabels.onCreated(function() {
  var self = this;
  var communityId = LocalStore.get('communityId');
  self.editState = new ReactiveVar(false);
  self.currentLabel = new ReactiveVar();
  self.selectedParents = new ReactiveVar([]);
  self.autorun(function() {
    Meteor.subscribe('labels.community', communityId);
    //disableInputs(true);
  });
});

Template.AdminLabels.events({
  'click .label-tree-item ' (event, template){

    $("#myUL .active-item").each(function() {
       $(this).removeClass("active-item");
    });
    $(event.currentTarget).addClass("active-item");
    let editState = Template.instance().editState.get();
    let labelId = event.currentTarget.getAttribute('data-id');
    event.stopPropagation();
    if(labelId){
      if(editState==false){
        template.currentLabel.set(labelId);
      }else{
        let selectedParents = template.selectedParents.get();
        if(!selectedParents.includes(labelId)){
          selectedParents.push(labelId);
          template.selectedParents.set(selectedParents);
        }
      }
    }
  },
  'click .caret'(event, template){
    $(event.currentTarget).parent(".label-tree-item").children(".nested").toggleClass("active")
    $(event.currentTarget).toggleClass("caret-down");
  },
  'click #edit-label-button'(event, template){
    event.preventDefault();
    template.editState.set(true);
    let selectedLabel = Labels.findOne({_id:Template.instance().currentLabel.get()});
    if(typeof selectedLabel.parentLabels != 'undefined'){
      template.selectedParents.set(selectedLabel.parentLabels);
    }
  },
  'click #cancel-edit-button'(event, template){
    event.preventDefault();
    template.editState.set(false);
  },
  'click #add-label-button'(event, template){
    event.preventDefault();
    template.selectedParents.set([]);
    template.currentLabel.set();
    document.getElementById("add-label").reset();
    template.editState.set(true);
  },
  'click .delete-parent'(event, template){
    let id = $(event.currentTarget).parent(".mdl-chip").attr("data-id");
    if(id){
      //event.stopPropagation();
      let selectedParents = template.selectedParents.get();
      if(selectedParents.includes(id)){
        var index = selectedParents.indexOf(id);    // <-- Not supported in <IE9
        if (index !== -1) {
            selectedParents.splice(index, 1);
        }
        template.selectedParents.set(selectedParents);
      }
    }
  },
  'click #save-button'(event, template){
    event.preventDefault();
    let labelId = $("#label-id").val();
    if(labelId){
      let label = {
        id: labelId,
        keyword: template.find("#label-text").value,
        description: template.find("#label-desc").value,
        communityId: LocalStore.get('communityId'),
        parentLabels: template.selectedParents.get()
      }
  		Meteor.call('editLabel', label, function(error, result){
  			if (error){
  				Bert.alert(error.reason, 'danger');
  			} else {
          console.log(result);
          template.currentLabel.set(result);
          template.editState.set(false);
  				Bert.alert(TAPi18n.__('admin.alerts.label-updated'), 'success');
  			}
  		});
    }else{
      let label = {
        keyword: template.find("#label-text").value,
        description: template.find("#label-desc").value,
        communityId: LocalStore.get('communityId'),
        parentLabels: template.selectedParents.get()
      }
  		Meteor.call('addLabel', label, function(error, result){
  			if (error){
  				Bert.alert(error.reason, 'danger');
  			} else {
          template.currentLabel.set(result);
          template.editState.set(false);
  				Bert.alert(TAPi18n.__('admin.alerts.label-added'), 'success');
  			}
  		});
    }
  },
  'click #delete-label-button'(event, template){
    event.preventDefault();
    let labelId = template.currentLabel.get();
    Meteor.call('deleteLabel', labelId, function(error, result){
      if (error){
        Bert.alert(error.reason, 'danger');
      } else {
        template.currentLabel.set();
        template.editState.set(false);
        Bert.alert(TAPi18n.__('admin.alerts.label-deleted'), 'success');
      }
    });
  }
});

Template.AdminLabels.helpers({
  editState: ()=> {
    return Template.instance().editState.get();
  },
  chipDeletable: ()=> {
    let editState = Template.instance().editState.get();
    if(editState==true){
      return "mdl-chip--deletable";
    }
    return;
  },
  currentLabel: ()=> {
    let id = Template.instance().currentLabel.get();
    return Labels.findOne({_id:id});
  },
  currentLabelId: ()=>{
    return Template.instance().currentLabel.get();;
  },
  currentLabelKeyword: ()=> {
    let id = Template.instance().currentLabel.get();
    let editState = Template.instance().editState.get();
    if(id&&editState){
      return Labels.findOne({_id:id}).keyword;
    }
  },
  currentLabelDesc: ()=> {
    let id = Template.instance().currentLabel.get();
    let editState = Template.instance().editState.get();
    if(id&&editState){
      return Labels.findOne({_id:id}).description;
    }
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

  }
});

Template.LabelChildren.helpers({
  childLabels: (labelId)=> {
    return Labels.find({parentLabels: labelId});
  },
  hasChildren: (labelId)=>{
    let childCount = Labels.find({parentLabels: labelId}).count();
    if(childCount > 0){
      return true;
    }
    return false;
  }
});

Template.AdminLabelsTable.onCreated(function() {
  var self = this;
  var communityId = LocalStore.get('communityId')
  self.autorun(function() {
    Meteor.subscribe('labels.community', communityId);
  });
  Session.set("labelIndex",-1);
});

Template.AdminLabelsTable.onRendered(function() {
  /*
  var toggler = document.getElementsByClassName("caret");
  var i;

  for (i = 0; i < toggler.length; i++) {
    console.log(i);
    toggler[i].addEventListener("click", function() {
      this.parentElement.querySelector(".nested").classList.toggle("active");
      this.classList.toggle("caret-down");
    });
  }
  */
});

Template.AdminLabelsTable.helpers({
  labels: ()=> {
    return Labels.find();
  },
  isApproved: function(){
  	return this.authorized;
  },
  labelDate: function(){
	   return moment(this.createdAt).format('DD MMMM YYYY');
  }
});

Template.AdminLabelsTable.events({
	'click .approve-button-class' (event, template){
		event.preventDefault();
    let labelId = event.target.dataset.labelId;
    let authorised = !event.target.dataset.labelAuthorized;
		Meteor.call('toggleAuthorized', labelId,authorised, function(error){
			if (error){
				RavenClient.captureException(error);
				Bert.alert(error.reason, 'danger');
			} else {
				Bert.alert(TAPi18n.__('admin.alerts.label-updated'), 'success');
			}
		});
	},

	'click .delete-button-class': function(event, template){
		event.preventDefault();
		Meteor.call('deleteLabel', event.target.dataset.labelId, function(error){
			if (error){
				RavenClient.captureException(error);
				Bert.alert(error.reason, 'danger');
			} else {
				Bert.alert("Label Deleted", 'success');
			}
		});
	},

});


function disableInputs(value) {
    var i;
    var inputs = document.querySelectorAll('#add-label input');
    for (i=0; i < inputs.length ; i++){
        inputs[i].disabled = value;
    }

    var textareas = document.querySelectorAll('#add-label textarea');
    for (i=0; i < textareas.length ; i++){
        textareas[i].disabled = value;
    }

    var element_is_disabled = document.querySelectorAll('#add-label .mdl-textfield--floating-label');
    for (i=0; i < element_is_disabled.length ; i++){
        element_is_disabled[i].classList.toggle('is-disabled');
    }

    if (!value) inputs[0].focus();
}
