import './landing.html';
//import './landing_files/app.js" type="text/javascript"></script>
//import './landing.scss';
Template.Landing.onRendered(function() {
  $(window).on('resize', function(){
    $("#viewport-size").text($(window).height() + "x" + $(window).width());
  });
});

Template.Landing.events({
  'click .menu-scroll-link, click .header-button': function(event, template){
    event.preventDefault();
    console.log($(this).hasClass( "active" ));
    let anchorId = event.currentTarget.dataset.anchor;
    scrollTo(anchorId);
  },
  'click .recent-stories-right': function(event,template){
    $('.recent-stories-scroller').animate({
          right: '200px'
      });
  },
  'click .get-started': function(event,template){
    event.preventDefault();
    console.log("should scroll to signup section");
    scrollTo("#signup-section");
  }
});


function scrollTo(elementId){
  console.log($(elementId));
  $('html, body').animate({
    scrollTop: $(elementId).offset().top
  }, 800);
}

Template.Landing.helpers({
	viewportSize: function(){
		return $(window).height() + "x" + $(window).width();
	},
  previewProposals: function(){
    let testProposals = [
      {
        _id: 1,
        title: "Test Propsal 1",
        coverURL: "url('https://source.unsplash.com/random/800x600')",
        abstract: "This is an abstract for Test Proposal 1",
        yes: 10,
        abstain: 30,
        no: 60,
        votecount: 82680,
        viewcount: 756902
      },
      {
        _id: 2,
        title: "Test Propsal 2",
        coverURL: "url('https://source.unsplash.com/random/800x600')",
        abstract: "This is an abstract for Test Proposal 2",
        yes: 70,
        abstain: 5,
        no: 25,
        votecount: 7422,
        viewcount: 10023
      },
      {
        _id: 3,
        title: "Test Propsal 3",
        coverURL: "url('https://source.unsplash.com/random/800x600')",
        abstract: "This is an abstract for Test Proposal 3",
        yes: 35,
        abstain: 35,
        no: 30,
        votecount: 153,
        viewcount: 24981
      },
      {
        _id: 4,
        title: "Test Propsal 4",
        coverURL: "url('https://source.unsplash.com/random/800x600')",
        abstract: "This is an abstract for Test Proposal 4",
        yes: 90,
        abstain: 5,
        no: 5,
        votecount: 832,
        viewcount: 526
      },{
        _id: 5,
        title: "Test Propsal 5",
        coverURL: "url('https://source.unsplash.com/random/800x600')",
        abstract: "This is an abstract for Test Proposal 5",
        yes: 70,
        abstain: 10,
        no: 30,
        votecount: 6064,
        viewcount: 6802
      }
    ];
    return testProposals;
  }
});
