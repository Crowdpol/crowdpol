import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Invitations } from './Invitations.js'

Meteor.methods({
  createInvitation: function(Invitation) {
    check(Invitation, {
      message: String,
      userId: String,
      url: String,
      icon: Match.Maybe(String)
      userId: String,
    	type: String,
      objectId: String,
      message: String,
      read: Boolean,
      accepted: Boolean
    });
    return Invitations.insert(Invitation);
  },
  deleteInvitation: function(InvitationId) {
    check(InvitationId, String);
    Invitations.remove(InvitationId);
  },
  getInvitation: function(InvitationId){
    check(InvitationId, String);
    return Invitations.findOne({_id: InvitationId});
  },
  readInvitation: function(InvitationId){
    check(InvitationId, String);
    Invitations.update({_id: InvitationId}, {$set: {"read": true}});
  },
  markAllAsRead: function(userId){
    check(userId, String);
    Invitations.update({userId: userId}, {$set: {"read": true}}, { multi: true });
  }
});
