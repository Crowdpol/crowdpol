import './test.html';
import './test.scss';

Template.Test.onCreated(function(){

});

Template.Test.onRendered(function(){
  Meteor.defer(function(){
    $( "#sortable" ).sortable();
    $( "#sortable" ).disableSelection();
  });
});

Template.Test.events({

});
Template.Test.helpers({

});
