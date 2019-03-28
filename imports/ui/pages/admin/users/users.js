import './users.html';
import RavenClient from 'raven-js';
import { Communities } from '../../../../api/communities/Communities.js'

Template.AdminUsers.onCreated(function() {
  var self = this;
  communityId = LocalStore.get('communityId');
  self.autorun(function() {
    self.subscribe('users.community', communityId);
    self.subscribe('community', communityId);
  });
});


Template.AdminUsers.helpers({
  users: ()=> {
    return Meteor.users.find({});
  },
  delegates: ()=> {
    return Meteor.users.find({"roles":"delegate"});
  },
  admins: ()=> {
    return Meteor.users.find({"roles":"admin"});
  },
  whitelist: ()=> {
	  var community = Communities.findOne({_id: LocalStore.get('communityId')});
	  var settings = community.settings;

	  var enforceWhitelist = settings.enforceWhitelist;

	  if (enforceWhitelist) {
	  	var emails = settings.emailWhitelist;
		  if (emails) {
		  	self.find("#emailWhitelist").value = emails.join(',');
		  	//self.find("#whitelistInput").MaterialTextfield.checkDirty()
		  }
	  	var checkbox = self.find('#whitelist-checkbox-label').MaterialCheckbox;
	  	checkbox.check();
	  	return community.settings.enforceWhitelist;
	  }
	 }
});

Template.AdminUsers.events({
  'click .delete-user' (event,template){
    var userId = event.target.dataset.id;
    if(typeof userId!=='undefined'){
      Confirm('Delete User', 'Are you sure you want to delete this user? This action cannot be undone.', 'Yes', 'Cancel',userId);
    }
  },
  'click .disable-user' (event,template){
    var userId = event.target.dataset.id;
    if(typeof userId!=='undefined'){
        Meteor.call('toggleAccount',userId,true,function(error,result){
          if (error){
    				RavenClient.captureException(error);
    				Bert.alert(error.reason, 'danger');
    			} else {
    				Bert.alert('User account disabled', 'success');
    			}
        });
    }
  },
  'click .remove-delegate-role'(event,template){
    var userId = event.target.dataset.id;
    if(typeof userId!=='undefined'){
        Meteor.call('toggleDelegate',userId,false,function(error,result){
          if (error){
    				RavenClient.captureException(error);
    				Bert.alert(error.reason, 'danger');
    			} else {
    				Bert.alert('User no longer delegate', 'success');
    			}
        });
    }
  },
  'click .remove-admin-role'(event,template){
    var userId = event.target.dataset.id;
    if(typeof userId!=='undefined'){
        Meteor.call('toggleAdmin',userId,false,function(error,result){
          if (error){
    				RavenClient.captureException(error);
    				Bert.alert(error.reason, 'danger');
    			} else {
    				Bert.alert('User no longer admin', 'success');
    			}
        });
    }
  },
  'click .make-admin' (event,template){
    var userId = event.target.dataset.id;
    if(typeof userId!=='undefined'){
        Meteor.call('toggleAdmin',userId,true,function(error,result){
          if (error){
    				RavenClient.captureException(error);
    				Bert.alert(error.reason, 'danger');
    			} else {
    				Bert.alert('User role updated', 'success');
    			}
        });
    }
  },
	'submit #invite' (event, template){
		event.preventDefault();

		let email = template.find("#invite-email").value;
			role = template.find("#invite-role").value;
			//url = Meteor.absoluteUrl('login');
			fromEmail = Meteor.user().emails[0].address;
			var hostname = window.location.host;
			url = 'https://' + hostname + '/signup';
		Meteor.call('sendInvite', email, role, url, fromEmail, function(error){
			if (error){
				RavenClient.captureException(error);
				Bert.alert(error.reason, 'danger');
			} else {
				Bert.alert('Message was sent!', 'success');
			}
		});
	},

	'submit #community-whitelist-form' (event, template){
		event.preventDefault();

		let emails = template.find("#emailWhitelist").value.split(',');
			enforceWhitelist = $('#whitelist-checkbox-label').hasClass('is-checked');

		Meteor.call('updateWhitelistSettings', emails, enforceWhitelist, communityId, function(error){
			if (error){
				RavenClient.captureException(error);
				Bert.alert(error.reason, 'danger');
			} else {
				Bert.alert(TAPi18n.__('admin.users.whitelist-updated'), 'success');
			}
		});
	},

	'click .dropdown-item': function(event, template){
		template.find('#invite-role').dataset.val = event.target.dataset.val;
		template.find('#invite-role').value = TAPi18n.__('components.role-selector.' + event.target.dataset.val);
	}
});


function Confirm(title, msg, $true, $false, userId) { /*change*/
  var $content =  "<div class='dialog-ovelay'>" +
                    "<div class='dialog'>"+
                      "<header>" +
                         "<h3> " + title + " </h3> " +
                         "<i class='fa fa-close'></i>" +
                      "</header>" +
                     "<div class='dialog-msg'>" +
                         " <p> " + msg + " </p> " +
                     "</div>" +
                     "<footer>" +
                         "<div class='controls'>" +
                             " <button class='button button-danger doAction'>" + $true + "</button> " +
                             " <button class='button button-default cancelAction'>" + $false + "</button> " +
                         "</div>" +
                     "</footer>" +
                  "</div>" +
                "</div>";
  $('body').prepend($content);
  $('.doAction').click(function () {
    Meteor.call('deleteUser',userId,function(error,result){
      if (error){
        RavenClient.captureException(error);
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('User deleted', 'success');
      }
    });
    $(this).parents('.dialog-ovelay').fadeOut(500, function () {
      $(this).remove();
    });
  });
  $('.cancelAction, .fa-close').click(function () {
    $(this).parents('.dialog-ovelay').fadeOut(500, function () {
      $(this).remove();
    });
    return false;
  });
}
