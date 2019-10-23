import './progressBubbles.html'

let steps = [];

Template.ProgressBubbles.onCreated(function(){

});

Template.ProgressBubbles.onRendered(function(){
  let els = document.getElementsByClassName('step');

  Array.prototype.forEach.call(els, (e) => {
    steps.push(e);
  });
  console.log("onRendered steps length: " +steps.length);
});

Template.ProgressBubbles.events({
  'click .step': function(e){
    console.log(e.currentTarget.id);
    progress(e.currentTarget.id);
  }
});

Template.ProgressBubbles.helpers({
  enoughSteps: function(){
    if(this.stepCount>1){
      return true;
    }
    return false;
  },
  steps: function(){
    var countArr = [];
    for (var i=0; i<this.stepCount; i++){
      countArr.push({});
    }
    console.log("steps rendered, this.stepCount: " + this.stepCount + ", countArr.length: " +countArr.length);
    return countArr;
  }
});

function progress(stepNum) {
  console.log("steps.length: " + steps.length);
  let distance = 100/(steps.length-1);
  console.log(distance);
  let p = stepNum * distance;
  console.log("stepNum: " + stepNum);
  document.getElementsByClassName('percent')[0].style.width = `${p}%`;
  steps.forEach((e) => {
    console.log("e.id: " + e.id);
    if (e.id === stepNum) {
      console.log("e.id === stepNum");
      e.classList.add('selected');
      e.classList.remove('completed');
    }
    if (e.id < stepNum) {
      console.log("e.id < stepNum");
      e.classList.add('completed');
    }
    if (e.id > stepNum) {
      console.log("e.id > stepNum");
      e.classList.remove('selected', 'completed');
    }
  });
}
