import './style.html'

Template.Style.onCreated(function(){

});

Template.Style.onRendered(function(){

});

Template.Style.events({
  'click .accordion': function(event,template){
    $(event.currentTarget).toggleClass("active");
    $(event.currentTarget).next().toggleClass("active");
    //$(panel).toggleClass("active");
  }
});

Template.Style.helpers({

});
