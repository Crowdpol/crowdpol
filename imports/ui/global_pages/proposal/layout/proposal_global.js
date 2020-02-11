import "./proposal_global.html";

/**/
//TEMPLATE FUNCTIONS FOR COVER
Template.Proposal_Cover.onCreated(function(){
  let proposalId = null;;
  if(self.data.proposalId){
    proposalId = Template.currentData().proposalId;
  }else{
    proposalId = FlowRouter.getParam("id");
  }
});
Template.Proposal_Cover.onRendered(function(){});
Template.Proposal_Cover.events({});
Template.Proposal_Cover.helpers({});

//TEMPLATE FUNCTIONS FOR MENUBAR
Template.Proposal_Menubar.onCreated(function(){});
Template.Proposal_Menubar.onRendered(function(){});
Template.Proposal_Menubar.events({});
Template.Proposal_Menubar.helpers({
  menuBarTitle: function(){
    return Session.get("menuBarTitle");
  }
});

//TEMPLATE FUNCTIONS FOR BODY
Template.Proposal_Body.onCreated(function(){});
Template.Proposal_Body.onRendered(function(){});
Template.Proposal_Body.events({});
Template.Proposal_Body.helpers({
  globalContent: function(){
    return Session.get("globalTemplate");
  }
});

//TEMPLATE FUNCTIONS FOR FOOTER
Template.Proposal_Footer.onCreated(function(){});
Template.Proposal_Footer.onRendered(function(){});
Template.Proposal_Footer.events({});
Template.Proposal_Footer.helpers({});
