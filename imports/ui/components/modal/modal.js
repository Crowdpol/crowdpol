import './modal.html'


export function showModal(){
  console.log("open me");
  $(".modal").addClass('active');
  $("#overlay").addClass('dark-overlay');
}

export function closeModal(){
  $(".modal").removeClass('active');
  $("#overlay").removeClass('dark-overlay');
}

Template.Modal.events({
  'click #overlay, click #close-modal': function(event, template){
    closeModal();
  },
});

Template.Modal.helpers({
	templateName: function(type){
    return 'Sunburst';
    /*
    if(type==="compass"){
      return true;
    }
    return false;
    */
  },
});
