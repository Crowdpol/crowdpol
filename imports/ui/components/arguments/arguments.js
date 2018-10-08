import './arguments.html'
import { Random } from 'meteor/random';

let argumentsForArray = [];
let argumentsAgainstArray = [];
/*
Template.Arguments.onCreated(function () {

  let self = this;
  self.argumentsFor = new ReactiveVar([]);
	self.argumentsAgainst = new ReactiveVar([]);
});

Template.Arguments.helpers({
  forArgumentsLang(lang){
    return Template.instance().argumentsFor.get();
  },
  againstArgumentsLang(lang){
    return Template.instance().argumentsAgainst.get();
  },
  setArguments(argumentsFor,argumentsAgainst,lang){
    //let parentView = Blaze.currentView.parentView.parentView.parentView;
    //let parentInstance = parentView.templateInstance();
    //console.log(parentView);
    if(typeof argumentsFor!='undefined'){
      let langArray = [];
      for(arg in argumentsFor){
        if(argumentsFor[arg].language == lang){
          langArray.push(argumentsFor[arg]);
        };
      }
      Template.instance().argumentsFor.set(langArray);
    }
    if(typeof argumentsAgainst!='undefined'){
      let langArray = [];
      for(arg in argumentsFor){
        if(argumentsAgainst[arg].language == lang){
          langArray.push(argumentsAgainst[arg]);
        };
      }
      Template.instance().argumentsAgainst.set(langArray);
    }
    if(typeof lang!='undefined'){
      //console.log(lang);
    }
  }
});

Template.Arguments.events({

});
*/
Template.ArgumentsListItem.events({
  'mouseenter .argument': function(e) {
    let argumentId = event.target.dataset.id;
    let menuIdentifier = "[data-id="+argumentId+"].argument-menu";
    if(typeof argumentId !='undefined'){
      //console.log(menuIdentifier);
      $(menuIdentifier).show();
    }
  },
  'mouseleave .argument': function(e) {
    $(".argument-menu").hide();
  },
  'click .delete-argument-button' (event, template){
    event.preventDefault();
    /*
    let commentId = event.currentTarget.getAttribute("data-id");
    if(checkIfOwner(commentId)){
      Meteor.call('deleteComment', commentId, function(error){
        if (error){
          RavenClient.captureException(error);
          Bert.alert(error.reason, 'danger');
        } else {
          Bert.alert(TAPi18n.__('pages.proposals.view.alerts.commentDeleted'), 'success');
        }
      });
    }
    */
  },
  'click .edit-argument-button' (event, template){
    event.preventDefault();
    let argumentId = event.target.dataset.id;
    //console.log("edit id: " + argumentId)
    if(typeof argumentId !='undefined'){
      let messageIdentifier = "[data-id='" + argumentId + "'].argument-text";
      let textareaIdentifier = "[data-id='" + argumentId + "'].argument-textarea";
      let editMenuIdentifier = "[data-id='" + argumentId + "'].edit-menu"
      let saveMenuIdentifier = "[data-id='" + argumentId + "'].save-menu";
      $(messageIdentifier).hide();
      $(textareaIdentifier).show();
      $(editMenuIdentifier).hide();
      $(saveMenuIdentifier).show();
    }
  },
  'click .close-argument-button' (event, template){
    event.preventDefault();
    let argumentId = event.target.dataset.id;
    //console.log("close id: " + argumentId)
    if(typeof argumentId !='undefined'){
      let messageIdentifier = "[data-id='" + argumentId + "'].argument-text";
      let textareaIdentifier = "[data-id='" + argumentId + "'].argument-textarea";
      let editMenuIdentifier = "[data-id='" + argumentId + "'].edit-menu"
      let saveMenuIdentifier = "[data-id='" + argumentId + "'].save-menu";
      $(messageIdentifier).show();
      $(textareaIdentifier).hide();
      $(editMenuIdentifier).show();
      $(saveMenuIdentifier).hide();
    }
  },
  'click .save-argument-button' (event, template){
    event.preventDefault();
    //let parentView = Blaze.currentView.parentView.parentView.parentView.parentView;
    //let parentInstance = parentView.templateInstance();

    let argumentId = event.target.dataset.id;
    let argumentLang = event.target.dataset.lang;
    let argumentType = event.target.dataset.type;

    //console.log("save id: " + argumentId)
    /*
    let argumentsArray = []

    if(argumentType=='for'){
      argumentsArray = parentInstance.argumentsFor.get()
    }
    if(argumentType=='against'){
      argumentsArray = parentInstance.argumentsAgainst.get();
    }
    */
    argumentsArray = Session.get('arguments');

    let index = argumentsArray.findIndex(argument => argument.argumentId === argumentId);
    var argument = argumentsArray.find(function (argument) { return argument.argumentId === argumentId; });
    //console.log(argument);
    //console.log(argumentsArray[index]);

    if(typeof argument !='undefined'){
      let messageIdentifier = "[data-id='" + argumentId + "'].argument-text";
      let textareaIdentifier = "[data-id='" + argumentId + "'][data-type='" + argumentType + "'].argument-textarea-input";
      let textareaDivIdentifier = "[data-id='" + argumentId + "'].argument-textarea";
      let editMenuIdentifier = "[data-id='" + argumentId + "'].edit-menu";
      let saveMenuIdentifier = "[data-id='" + argumentId + "'].save-menu";

      //console.log(textareaIdentifier);
      //console.log($(textareaIdentifier));
      if(typeof index !='undefined'){
        argument.message = $(textareaIdentifier).val();
        argumentsArray[index] = argument;
        Session.set('arguments',argumentsArray);

        /*
        if(argumentType=='for'){
          parentInstance.argumentsFor.set(argumentsArray);
          Session.set('argumentsFor',argumentsArray)
        }
        if(argumentType=='against'){
          parentInstance.argumentsAgainst.set(argumentsArray);
          Session.set('argumentsAgainst',argumentsArray)
        }*/

      }

      $(messageIdentifier).show();
      $(textareaDivIdentifier).hide();
      $(editMenuIdentifier).show();
      $(saveMenuIdentifier).hide();


    }
  }
})
function checkIfOwner(authorId){
  if(Meteor.user()._id == authorId){
    return true;
  }
  return false;
}
Template.ArgumentsListItem.helpers({
  setArgumentId(argumentId){
    if(typeof argumentId !='undefined'){
      return argumentId;
    }
    return Random.id();
  },
	authorName(authorId){
		let name = "";
		let user = Meteor.users.findOne({"_id":authorId});
		if(typeof user != 'undefined'){
			let profile = user.profile;

			if(typeof profile != 'undefined'){
				if('firstName' in profile){
					name+=profile.firstName + " ";
				}
				if('lastName' in profile){
					name+=profile.lastName;
				}
				/*
				if('username' in profile){
					name+="(" + profile.username + ")";
				}*/
				return name;
			}
		}
    return "anonymous";
	},
  isOwnArgument(authorId){
    if(authorId==Meteor.user()._id){
      return true;
    }
    return false;
  }
});
Template.ArgumentsBox.helpers({
  testFudge(fudge){
    //fudge.push("yebo");
    return fudge;
  },
});
Template.ArgumentsBox.events({
  'click .add-argument-button .add-argument-icon' (event, template){
    event.preventDefault();
    //get Parent Template instance for reactiveVar
    //let parentView = Blaze.currentView.parentView.parentView;
    //let parentInstance = parentView.templateInstance();
    //get the correct input field by language and argument
    let argumentType = event.target.dataset.type;
    let argumentLang = event.target.dataset.lang;
    let argumentTextIdentifier = "[data-type='" + argumentType + "'][data-lang='" + argumentLang + "'].argument-input";
    //console.log(argumentTextIdentifier);
    if(typeof argumentType !='undefined'){
      //create arguments
      let argument = {
        argumentId: Random.id(),
        type: argumentType,
        message: $(argumentTextIdentifier).val(),
        authorId: Meteor.user()._id,
        createdAt: moment().format('YYYY-MM-DD'),
        lastModified: moment().format('YYYY-MM-DD'),
        upVote: [],
        language: argumentLang,
        downVote: [],
      };

      argumentsArray = Session.get('arguments');
      argumentsArray.push(argument);
      Session.set('arguments',argumentsArray);
      //console.log(argumentsArray);
      //update reactiveVar
      /*
      if(argumentType=='for'){
        argumentsForArray = parentInstance.argumentsFor.get();
        argumentsForArray.push(argument);
        parentInstance.argumentsFor.set(argumentsForArray);
        Session.set('argumentsFor',argumentsForArray)
      }
      if(argumentType=='against'){
        argumentsAgainstArray = parentInstance.argumentsAgainst.get();
        argumentsAgainstArray.push(argument);
        parentInstance.argumentsAgainst.set(argumentsAgainstArray);
        Session.set('argumentsAgainst',argumentsAgainstArray)
      }
      */
      $(argumentTextIdentifier).val('');
    }
  }
});
