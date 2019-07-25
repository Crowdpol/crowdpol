import './wizard.html';

Template.Wizard.onCreated(function(){
  self = this;
  //Reactive Variables
  self.currentStep = new ReactiveVar([]);
  self.currentStep.set("1");
});

Template.Wizard.helpers({
	profile: function(){
    let user = Meteor.user();
    return user.profile;
  },
  userId: function(){
    return Meteor.userId();
  },
});

Template.Wizard.events({
	'click .wizard-next' (event, template){
		event.preventDefault();
		template.currentStep.set(moveStep(template.currentStep.get(),1));
	},
  'click .wizard-back' (event, template){
		event.preventDefault();
		template.currentStep.set(moveStep(template.currentStep.get(),-1));
	},
});

/*
** -1 for back, 1 for forwards
*/
function moveStep(currentStep,direction){;
  let nextStep = direction + parseFloat(currentStep);
  let currentStepSelector = '*[data-section="'+currentStep+'"]';
  let nextStepSelector = '*[data-section="'+nextStep+'"]';
  $(currentStepSelector).hide();
  $(nextStepSelector).show();
  return nextStep;
}
