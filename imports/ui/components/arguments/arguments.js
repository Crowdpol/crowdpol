import './arguments.html'
import { Random } from 'meteor/random';

//let argumentsForArray = [];
//let argumentsAgainstArray = [];
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
    if(typeof argumentId !='undefined'){
      let messageIdentifier = "[data-id='" + argumentId + "'].argument-text";
      let textareaIdentifier = "[data-id='" + argumentId + "'].argument-textarea";
      let editMenuIdentifier = "[data-id='" + argumentId + "'].edit-menu"
      let saveMenuIdentifier = "[data-id='" + argumentId + "'].save-menu";
      $(messageIdentifier).hide();
      $(textareaIdentifier).show();
      $(editMenuIdentifier).hide();
      $(saveMenuIdentifier).show();
      console.log(messageIdentifier);
    }
  },
  'click .close-argument-button' (event, template){
    event.preventDefault();
    let argumentId = event.target.dataset.id;
    if(typeof argumentId !='undefined'){
      let messageIdentifier = "[data-id='" + argumentId + "'].argument-text";
      let textareaIdentifier = "[data-id='" + argumentId + "'].argument-textarea";
      let editMenuIdentifier = "[data-id='" + argumentId + "'].edit-menu"
      let saveMenuIdentifier = "[data-id='" + argumentId + "'].save-menu";
      $(messageIdentifier).show();
      $(textareaIdentifier).hide();
      $(editMenuIdentifier).show();
      $(saveMenuIdentifier).hide();
      console.log(messageIdentifier);
    }
  },
  'click .save-argument-button' (event, template){
    event.preventDefault();
    let authorId = Meteor.user()._id;
    let argumentId = event.target.dataset.id;
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
  }
})
function checkIfOwner(authorId){
  if(Meteor.user()._id == authorId){
    return true;
  }
  return false;
}
Template.ArgumentsListItem.helpers({
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

Template.ArgumentsBox.events({
  'click .add-argument-button .add-argument-icon' (event, template){
    event.preventDefault();
    let parentView = Blaze.currentView.parentView.parentView;
    console.log(parentView);
    let parentInstance = parentView.templateInstance();
    console.log(parentInstance);
    //console.log(template.view.parentView.parentView._templateInstance.argumentsFor.curValue);
    let argumentType = event.target.dataset.type;
    let argumentLang = event.target.dataset.lang;
    let argumentTextIdentifier = "[data-type='" + argumentType + "'][data-lang='" + argumentLang + "'].argument-input";
    console.log($(argumentTextIdentifier).val());
    if(typeof argumentType !='undefined'){
      let argument = {
        _id: Random.id(),
        type: argumentType,
        message: $(argumentTextIdentifier).val(),
        authorId: Meteor.user()._id,
        createdAt: moment().format('YYYY-MM-DD'),
        lastModified: moment().format('YYYY-MM-DD'),
        upVote: [],
        downVote: [],
        language: argumentLang
      };

      if(argumentType=='for'){
        let argumentsArray = parentInstance.argumentsFor.get();
        argumentsArray.push(argument);
        parentInstance.argumentsFor.set(argumentsArray);
      }
      if(argumentType=='against'){
        let argumentsArray = parentInstance.argumentsAgainst.get();
        argumentsArray.push(argument);
        parentInstance.argumentsAgainst.set(argumentsArray);
      }
    }
  }
})
