import './landing.html';
//import './landing_files/app.js" type="text/javascript"></script>
//import './landing.scss';


Template.Landing.events({
  'click .menu-scroll-link': function(event, template){
    event.preventDefault();
    console.log($(this).hasClass( "active" ));
    let anchorId = event.currentTarget.dataset.anchor;
    scrollTo(anchorId);
  }
});


function scrollTo(elementId){
  $('html, body').animate({
    scrollTop: $(elementId).offset().top
  }, 2000);
}
