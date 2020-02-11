import './menus/menus.js'
import './content/content.js'
import './global.html'

Template.Global.onCreated(function(){
  self = this;
  if(!Session.get("globalTemplate")){
    Session.set("globalTemplate","Navigator_Vote_Content");
  }
});

Template.Global.onRendered(function(){

  //Note: because the content is dynamic, better to use global event handlers instead of template level.
  //      These events are used throught the global layout

  let firstActiveTemplateLinkText = $(".global-sidebar-menu > a.active > div.global-template-link-text").text().trim();
  //$(".global-menubar-title").text(firstActiveTemplateLinkText);
  //console.log(firstActiveTemplateLinkText);
  Session.set("menuBarTitle",firstActiveTemplateLinkText);



  //Global Event Handler for Sidebar and Footer links
  $( ".global-template-link" ).click(function() {

    //remove active from all neighbouring menu items
    $(event.currentTarget).parent().children().each(function(i,obj){
      $(this).removeClass('active');
    });
    //set current menu item to active
    $(event.currentTarget).addClass("active");
    //get current template from menu data attribute
    let globalTemplate = $(event.currentTarget).data("template");
    //assign template name to session for use in other templates
    Session.set("globalTemplate",globalTemplate);

    //disable current active menu bar tabs
    $(".global-menu-tabs").each(function(i,obj){
      $(this).removeClass('active');
      $(this).children().removeClass('active');
      $(this).children(":first").addClass('active');
    });
    //enable appropriate menu bar tab
    let selector = ".global-menu-tabs[data-template='" + globalTemplate + "']"
    $(selector).addClass("active");

    //update menu bar title
    let menuBarTitle = $(event.currentTarget).find(".global-template-link-text").text().trim();
    Session.set("menuBarTitle",menuBarTitle);

  });

  //Global Event Handler for MenuBar tabs
  $(".global-menu-tab").click(function() {
    let selectedTab = event.currentTarget;
    //
    $(selectedTab).parent().children().each(function(i,obj){
      $(this).removeClass('active');
    });
    $(selectedTab).addClass("active");
    //Take a selected .global-menu-tab and show the corresponding .content-tab-panel
    let currentTab = $(selectedTab).data("id");
    enableTabContent(currentTab);
  });


});

//Enables the tab content selected in the MenuBar
function enableTabContent(currentTab){
  //hide other content-tab-panel divs
  $(".content-tab-panel").each(function(i,obj){
    $(this).removeClass("active");
  });
  let selector = "#" + currentTab;
  $(selector).addClass("active");
}

//Move this to MenuBar
Template.Global.events({
  'click #cover-toggle': function(event, template){
    $(".global-cover").slideToggle(1000,"swing",function(){
      $(".cover-toggle-icon").toggle();
      $(".global-wrapper").toggleClass("cover-hidden")
    });
  },
});
/*
Template.Global.helpers({});
*/
