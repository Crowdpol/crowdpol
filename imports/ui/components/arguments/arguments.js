import './arguments.html'
import { Random } from 'meteor/random';
import RavenClient from 'raven-js';
import { getUserProfilePhoto, getUserfullname, getUsername } from '../../../utils/users';
import { urlify } from '../../../utils/functions';

Template.ArgumentsListItem.onCreated(function(){
  proposalId = FlowRouter.getParam("id");
  this.proposalId = new ReactiveVar(proposalId);
});
Template.ArgumentsListItem.events({
  'mouseenter .argument': function(e) {
    let argumentId = event.target.dataset.id;
    let menuIdentifier = "[data-id="+argumentId+"].argument-menu";
    if(typeof argumentId !='undefined'){
      $(menuIdentifier).show();
    }
  },
  'mouseleave .argument': function(e) {
    $(".argument-menu").hide();
  },
  'click .delete-argument-button' (event, template){
    event.preventDefault();
    let argumentId = event.target.dataset.id;
    let argumentLang = event.target.dataset.lang;
    let argumentType = event.target.dataset.type;
    let argumentIdentifier = "[data-id='" + argumentId + "'].argument";

    if(this.state=='view'){
      Meteor.call('deleteComment', argumentId, function(error){
        if (error){
          RavenClient.captureException(error);
          Bert.alert(error.reason, 'danger');
        } else {
          Bert.alert(TAPi18n.__('pages.proposals.view.alerts.commentDeleted'), 'success');
        }
      });
    }else{
      argumentsArray = Session.get('arguments');

      let index = argumentsArray.findIndex(argument => argument._id === argumentId);
      var argument = argumentsArray.find(function (argument) { return argument._id === argumentId; });

      if(typeof argument !='undefined'){

        if(typeof index !='undefined'){
          if (index > -1) {
            argumentsArray.splice(index, 1);
            Session.set('arguments',argumentsArray);
          }
        }

      }
    }
    $(argumentIdentifier).remove();
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
    }
  },
  'click .save-argument-button' (event, template){
    event.preventDefault();

    let argumentId = event.target.dataset.id;
    let argumentLang = event.target.dataset.lang;
    let argumentType = event.target.dataset.type;

    let messageIdentifier = "[data-id='" + argumentId + "'].argument-text";
    let textareaIdentifier = "[data-id='" + argumentId + "'][data-type='" + argumentType + "'].argument-textarea-input";
    let textareaDivIdentifier = "[data-id='" + argumentId + "'].argument-textarea";
    let editMenuIdentifier = "[data-id='" + argumentId + "'].edit-menu";
    let saveMenuIdentifier = "[data-id='" + argumentId + "'].save-menu";

    if(this.state=='view'){
        Meteor.call('updateComment', argumentId, $(textareaIdentifier).val(),function(error){
          if (error){
            RavenClient.captureException(error);
            Bert.alert(error.reason, 'danger');
          } else {
            Bert.alert(TAPi18n.__('pages.proposals.view.alerts.commentUpdated'), 'success');
          }
        });
    }else{
      argumentsArray = Session.get('arguments');

      let index = argumentsArray.findIndex(argument => argument._id === argumentId);
      var argument = argumentsArray.find(function (argument) { return argument._id === argumentId; });

      if(typeof argument !='undefined'){


        if(typeof index !='undefined'){
          argument.message = $(textareaIdentifier).val();
          argumentsArray[index] = argument;
          Session.set('arguments',argumentsArray);
        }
      }
    }
    //update menu display
    $(messageIdentifier).show();
    $(textareaDivIdentifier).hide();
    $(editMenuIdentifier).show();
    $(saveMenuIdentifier).hide();
  },
  'click .like-argument-button' (event, template){
    event.preventDefault();
    let argumentId = event.target.dataset.id;

    if(typeof argumentId !='undefined'){

      Meteor.call('upvoteComment', argumentId,function(error){
        if (error){
          RavenClient.captureException(error);
          Bert.alert(error.reason, 'danger');
        } else {
          //Bert.alert('upvoted', 'success');
          //let buttonIdentifier = "[data-id='" + argumentId + "'].like-argument-button";
          //$(buttonIdentifier).addClass("mdl-button--primary");
        }
      });
    }
  },
  'click .dislike-argument-button' (event, template){
    event.preventDefault();
    let argumentId = event.target.dataset.id;

    if(typeof argumentId !='undefined'){
      Meteor.call('downvoteComment', argumentId,function(error){
        if (error){
          RavenClient.captureException(error);
          Bert.alert(error.reason, 'danger');
        } else {
          //Bert.alert('downvoted', 'success');
        }
      });
    }
  }
});
function checkIfOwner(authorId){
  if(Meteor.user()._id == authorId){
    return true;
  }
  return false;
}
Template.ArgumentsListItem.helpers({
  argumentDate(lastModified){
    lastUpdated = moment(lastModified).fromNow();
    return lastUpdated;
  },
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
  authorImage(authorId){
    return getUserProfilePhoto(authorId);
	},
  isLiked(){
    upVotes = this.argument.upVote;
    if(typeof upVotes != 'undefined'){
      if(upVotes.indexOf(Meteor.user()._id)>-1){
        return "mdl-button--primary";
      }
    }
  },
  isDisliked(){
    downVotes = this.argument.downVote;
    if(typeof downVotes != 'undefined'){
      if(downVotes.indexOf(Meteor.user()._id)>-1){
        return "mdl-button--primary";
      }
    }
  },
  isOwnArgument(authorId){
    if(authorId==Meteor.user()._id){
      return true;
    }
    return false;
  },
  urlifyMessage(message){
    return urlify(message);
  }
});

Template.ArgumentsBox.events({
  'click .add-argument' (event, template){
    event.preventDefault();
    if (Meteor.user()){
      let proposalId = template.data.proposalId;
      postArgument(event,this.state,proposalId);
    }else{
      openSignInModal();
    }
    event.stopImmediatePropagation();
  },
  'keyup .argument-input' (event, template){
    event.preventDefault();
    if (event.which === 13) {
      if (Meteor.user()){
        let proposalId = template.data.proposalId;
        console.log("proposalId: " + proposalId);
        postArgument(event,this.state,proposalId);
      }else{
        openSignInModal();
      }
    }
    event.stopImmediatePropagation();

  },
  'focus .argument-input' (event, template){
    let argumentType = event.target.dataset.type;
    let  argumentButtonIdentifier = "#" + argumentType + "-button";
    //$(argumentButtonIdentifier).show();
  },
  'blur .argument-input' (event, template){
    let argumentType = event.target.dataset.type;
    let  argumentButtonIdentifier = "#" + argumentType + "-button";
    //$(argumentButtonIdentifier).hide();
  }
});

function postArgument(event,state,proposalId){
  //get the correct input field by language and argument
  let argumentType = event.target.dataset.type;
  let argumentLang = event.target.dataset.lang;
  let argumentTextIdentifier = "[data-type='" + argumentType + "'][data-lang='" + argumentLang + "'].argument-input";
  if(typeof argumentType !='undefined'){
    //create arguments
    let message = $(argumentTextIdentifier).val();

    //let proposalId = template.data.proposalId;
    if(!message){
      Bert.alert("Please enter a valid argument");
      return false;
    }
    message = message.replace(/\r?\n|\r/g, " ");

    if(state=='view'){

      if(proposalId){
        let argument = {
          type: argumentType,
          message: message.trim(),
          authorId: Meteor.user()._id,
          upVote: [],
          language: argumentLang,
          downVote: [],
          proposalId: proposalId
        }

        Meteor.call('comment', argument, function(error){
          if(error){
            RavenClient.captureException(error);
            Bert.alert(error.reason, 'danger');
          } else {
            Bert.alert(TAPi18n.__('pages.proposals.view.alerts.commentPosted'), 'success');
            $(argumentTextIdentifier).val('');
          }
        });
      }else{
        Bert.alert("Something went wrong","danger");
      }

    }else{
      let argument = {
        _id: Random.id(),
        type: argumentType,
        message: message.trim(),
        authorId: Meteor.user()._id,
        createdAt: moment().format('YYYY-MM-DD'),
        lastModified: moment().format('YYYY-MM-DD'),
        upVote: [],
        language: argumentLang,
        downVote: [],
        proposalId: proposalId
      }
      argumentsArray = Session.get('arguments');
      argumentsArray.push(argument);
      Session.set('arguments',argumentsArray);
      console.log(argumentsArray);
      $(argumentTextIdentifier).val('');
    }
  }else{
    Bert.alert("argumentType could not be defined","danger");
  }

}
