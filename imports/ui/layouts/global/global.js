import './menus/menus.js'
import './content/content.js'
import './global.html'

Template.Global.onCreated(function(){
  self = this;
});

Template.Global.onRendered(function(){
  $( ".global-template-link" ).click(function() {
    //remove active from all neighbouring tabs
    $(event.currentTarget).parent().children().each(function(i,obj){
      $(this).removeClass('active');
    });
    $(event.currentTarget).toggleClass("active");
    let content = $(event.currentTarget).data("id");
    //loadNavigatorContent(content)
  });
  $(".global-template-link").click(function() {
    let globalTemplate = $(event.currentTarget).data("template");
    Session.set("globalTemplate",globalTemplate);
    $(".global-menu-tabs").each(function(i,obj){
      $(this).removeClass('active');
    });
    let selector = ".global-menu-tabs[data-template='" + globalTemplate + "']"
    $(selector).addClass("active");
    //console.log("show tab selector: " + selector );
  });
  $(".global-menu-tab").click(function() {
    $(event.currentTarget).parent().children().each(function(i,obj){
      $(this).removeClass('active');
    });
    let currentTab = $(event.currentTarget).data("id");
    let selector = ".global-menu-tab[data-id='" + currentTab + "']"
    console.log("tab selector: " + selector);
    $(selector).addClass("active");
    $(event.currentTarget).parent().children().each(function(i,obj){
      $(this).removeClass('active');
    });
    $(".community-tabs-panel").each(function(i,obj){
      $(this).removeClass("active");
    });
    selector = "#" + currentTab;
    $(selector).addClass("active");
  });
});

Template.Global.events({
  'click #cover-toggle': function(event, template){
    $(".global-cover").slideToggle(1000,"swing",function(){
      $(".cover-toggle-icon").toggle();
      $(".global-wrapper").toggleClass("cover-hidden")
    });
  },
});

Template.Global.helpers({
  /*
  content: function(data){
    var template = Template.instance();
    console.log(this)
    console.log(template);
    return {
      cover: "NavigatorMenu",
      menu: "PresenceMenu",
      body: "ProposalBody"
    }
  },
  contentCover: function(){
    return "PresenceCover";
  },
  contentMenu: function(){
    return "NavigatorMenu";
  },
  contentBody: function(){
    return "NavigatorBody";
  },
  contentFooter: function(){
    return "NavigatorFooter";
  },
  */
});
