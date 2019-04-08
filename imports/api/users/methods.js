import { check } from 'meteor/check';
import { Random } from 'meteor/random';
import { Ranks } from '../ranking/Ranks.js'
import { Notifications } from '../notifications/Notifications.js'

Meteor.methods({
    checkIfUserExists: function (email,communityId) {
      let user = Accounts.findUserByEmail(email);
      if (typeof user === 'undefined' || user === null) {
          return false;// variable is undefined or null
      }else{
        Meteor.users.update({_id: user._id}, {$push: {'profile.communityIds': communityId} });
        return true;
      }
    },
    addUser: function (newUser) {
      userId = Accounts.createUser(newUser);
      return userId;
    },
    isPublic: function (userId) {
      check(userID, String);
      user = Meteor.users.findOne({_id: Meteor.userId()},{fields: {profile: 1,roles: 1,isPublic: 1}});;
      return user.isPublic;
    },
    getUser: function (userID) {
      check(userID, String);
      const users = Meteor.users.find({_id: userID}).fetch();
        return users[0];
    },
    deleteUser: function (userID) {
      check(userID, String);
      //TODO: Delete all user's content
      Meteor.users.remove({_id:userID});
    },
    toggleAccount: function (userID,isDisabled) {
      check(userID, String);
      check(isDisabled, Boolean);
      Meteor.users.update({_id: userID}, {$set: {"isDisabled": isDisabled}});
    },
    getProfile: function (userID) {
      check(userID, String);
      const users = Meteor.users.find({_id: userID},{fields: {profile: 1, isPublic:1}}).fetch();
      return users[0];
    },
    getUserTags: function(userID) {
      check(userID, String);
      const users = Meteor.users.find({_id: userID},{fields: {profile: 1}}).fetch();
      return users[0].profile.tags;
    },
    updateProfile: function (profile) {
      searchString = profile.firstName + " " + profile.lastName + " " + profile.username;
      profile["searchString"] = searchString;
      var oldProfile = Meteor.user().profile;
      var newProfile = _.extend(oldProfile, profile);
      Meteor.users.update({_id: Meteor.userId()}, {$set: {"profile": newProfile}});
    },
    togglePublic: function (userID,isPublic) {
      check(userID, String);
      check(isPublic, Boolean);
      Meteor.users.update({_id: userID}, {$set: {"isPublic": isPublic}});
      /*if a user has pending request for delegate/candidate approval
      and makes their profile private, remove the requests*/
      var user = Meteor.call('getUser', userID)
      var approvals = user.approvals;
      if (approvals) {
        var pendingApprovals = approvals.find(approval => approval.status == 'Requested');
        if (pendingApprovals){
          Meteor.users.update({_id: userID}, {$set: {"approvals": []}});
        }
      }
    },
    isApproved: function(userID) {
      check(userID, String);
      user = Meteor.call('getUser', userID);

      if (user.approvals){
        for (i = 0; i < user.approvals.length; i++){
          if (user.approvals[i].status != 'Approved'){
            return false;
          }
        }
      } else {
        return false;
      }

      return true;

    },
    clearApprovals: function(userID){
      check(userID, String);
      Meteor.users.update({_id: userID}, {$set: {"approvals": []}});
    },
    toggleAdmin: function(userId,state){
      check(userId, String);
      if(state){
        Roles.addUsersToRoles(userId, 'admin');
      }else{
        Roles.removeUsersFromRoles(userId, 'admin');
      }
    },
    toggleDelegate: function(userId,state){
      check(userId, String);
      if(state){
        Roles.addUsersToRoles(userId, 'delegate');
      }else{
        Roles.removeUsersFromRoles(userId, 'delegate');
      }
    },
    approveUser: function(userID, requestId, status){
      check(userID, String);
      check(requestId, String);
      check(status, String);
      user = Meteor.users.findOne({_id: userID, "approvals": {$exists: true}, $where : "this.approvals.length > 0"});

      approvals = user.approvals;
      var type = null;
      for (i=0; i<approvals.length; i++){
        if(approvals[i].id==requestId){
          approvals[i].status = status;
          approvals[i].reviewedBy = Meteor.userId();
          approvals[i].reviewedOn = new Date();
          type = approvals[i].type;
        }
      }
      Meteor.users.update({_id: userID}, {$set: {'approvals': approvals}});
      if(type&&status=='Approved'){
        Roles.addUsersToRoles(userID, type);
      }

      // Create user notification
      var message;
      var icon;
      if (status=='Approved') {
        message = TAPi18n.__('notifications.approvals.' + type + '.approved');
        icon = 'check';
      } else if (status=='Rejected') {
        message = TAPi18n.__('notifications.approvals.' + type + '.rejected')
        icon = 'do_not_disturb';
      }

      Meteor.call('createNotification', {message: message, userId: userID, url: '/profile', icon: icon})
    },
    requestApproval: function (userId, type) {
      check(userId, String);
      check(type, String);
      //don't create request unless profile is complete
      if (profileIsComplete(Meteor.user())) {
        //check if this user already has an approval of this type
        //users should only ever have one approval per
        var existingApprovalCount = Meteor.users.find({$and:[{_id: userId},{'approvals.type': type}]}).count();
        if (existingApprovalCount > 0){
          //an approval request of this type already exists - remove it.
          Meteor.users.update({_id: userId}, {$pull: {approvals: {type: type}} });
        }
        //get current user approvalRequests
        var currentApprovals = Meteor.user().approvals;
        //add to existing array before update, or else it just replaces what is already there
        const existingRequests = currentApprovals || [];
        existingRequests.push({
          "id": Random.id(),
          "type" : type,
          "status" : "Requested",
          "createdAt" : new Date(),
        });
        Meteor.users.update({_id: Meteor.userId()}, {$set: {"approvals": existingRequests}});
      } else {
        throw new Meteor.Error(422, TAPi18n.__('pages.profile.alerts.profile-incomplete'));
      }

    },
    removeRequest: function (userId, type) {
      check(userId, String);
      check(type, String);
      Meteor.users.update({_id: Meteor.userId()},{$pull: {approvals: {status: 'Requested',type: type}}});
    },
    toggleRole: function (role,state) {
      check(role, String);
      check(state, Boolean);
      var delegate = Meteor.user();
      var delegateId = Meteor.userId();
      if(state){
        if ((role == 'delegate' || role == 'candidate')){
          if (delegate.isPublic){
            Roles.addUsersToRoles(delegateId, role);
          }
        } else {
          Roles.addUsersToRoles(delegateId, role);
        }
      }else{
        // Remove user from role
        Roles.removeUsersFromRoles(delegateId, role);
        //Create notifications for each supporter
        if (role == 'delegate'){
          var delegateName = delegate.profile.firstName + delegate.profile.lastName;
          var supporterIds = Ranks.find({entityId: delegateId}).pluck('supporterId');
          // Create notifications
          var notifications = []
          if (supporterIds){
            _.each(supporterIds, function(id){
              var notification =
              notifications.push({
                message: TAPi18n.__('notifications.users.delegate-deselect', delegateName),
                userId: id,
                url: '/delegate',
                icon: 'warning',
                read: false,
                createdAt: new Date()
              })
            });
            // Batch insert notifications
            Notifications.batchInsert(notifications);
          }

          // Remove delegate from user rankings
          Ranks.remove({entityId: delegateId});
        }
      }
    },
    getRequests(){
      return Meteor.users.find({});//,{fields: {profile: 1,roles: 1,isPublic: 1,isParty: 1, approvals: 1, emails: 1}}).fetch();
    },
    getProfileUsernameCount(username){
      check(username,String);
      var count = Meteor.users.find({'profile.username': username}).count();
      return count;
    },
    //this function checks the current user's username and id against the existing ones
    //Returns true if username is unique, false otherwise
    updateUsernameIsUnique(username){
      check(username, String);
      var count = Meteor.users.find({"_id":{$ne: Meteor.userId()},"profile.username": {$eq: username}}).count();
      if(count > 0){
        return false;
      }
      return true;
    },
    //TODO: check approvals and roles and send appropriate message
    getApprovalStatus(userId,type){
      check(userId,String);
      check(type,String);
      var result = Meteor.users.aggregate([
        { $unwind : "$approvals" },
        {
          $match: {"_id" : userId,"approvals" : {$exists: true}, "approvals.type":{$eq: type}}
        },
        { $sort : { "approvals.createdAt": -1} },
        {
          $project: {
            "_id": 0,
            "status": "$approvals.status",
          }
        },

        { $limit : 1 }
      ]);
      if(result.length>0){
        return result[0].status;
      }
      return false;
    },
    getDelegateStatus(userId){
      check(userId,String);
      return Meteor.call('getApprovalStatus',userId,'delegate');
    },
    getCandidateStatus(userId){
      check(userId,String);
      return Meteor.call('getApprovalStatus',userId,'candidate');;
    },
    searchUsers(search){
      check(search,String);
      var result = Meteor.users.find( { $text: { $search: search } } );
    },
    getUserSearchString(userId){
      check(userId,String);
      var result =  Meteor.users.find(
        { $unwind : "$profile" },
        { $match: {"_id" : userId}},
        { $project: {"_id": 0, "searchString": {$concat: ["$profile.firstName"," ","$profile.lastName"," ","$profile.username"]} } }
      );
      if(result.length>0){
        return result[0].searchString;
      }
      return false;
    },
    signupNewsletter(email){
        check(email,String);
        testUser = {
          email:  email,
          password: Random.id()
        };
        testUser._id = Meteor.call('addUser', testUser);
        Roles.addUsersToRoles(testUser._id, "newsletter");
        Meteor.call('sendNewsletterConfirmation',email, (error, response) => {
          if (error){
            return false;
          } else {
            return true
          }
        });

      return false;
    },
    addFollower: function(userId,followId) {
      check(userId, String);
      check(followId, String);
      Meteor.users.update({_id: userId}, {$push: {'profile.following': followId} });
    },
    removeFollower: function(userId,followId) {
      check(userId, String);
      check(followId, String);
      Meteor.users.update({_id: userId}, {$pull: {'profile.following': followId} });
    },
    addTagToProfile: function(userId, tag) {
      check(userId, String);
      check(tag, {
        keyword: String,
        url: String,
        _id: String });
      Meteor.users.update({_id: userId}, {$push: {'profile.tags': tag} });
    },
    removeTagFromProfile: function(userId, tag) {
      check(userId, String);
      check(tag, {
        keyword: String,
        url: String,
        _id: String });
      Meteor.users.update({_id: userId}, {$pull: {'profile.tags': tag} });
    },
    acceptTerms: function() {
      Meteor.users.update({_id: Meteor.userId()}, {$set: {'profile.termsAccepted': true}});
    },
    sendForgotPasswordEmail: function(email, rootUrl) {

      Accounts.emailTemplates.resetPassword = {
        subject() {
          return TAPi18n.__('emails.reset-password.subject');
        },
        text( user, url ) {
          let emailAddress   = user.emails[0].address,
              token = url.substring(url.lastIndexOf('/')+1, url.length);
              newUrl = rootUrl + '/reset-password/' + token;
              supportEmail   = Meteor.settings.private.fromEmail,
              emailBody      = TAPi18n.__('emails.reset-password.body', {url: newUrl, supportEmail: supportEmail});

          return emailBody;
        }
      };

      var userId = Accounts.findUserByEmail(email)._id;

      Accounts.sendResetPasswordEmail(userId, email, function(error) {
            if (error) {
              RavenClient.captureException(error);
              Bert.alert(error.reason, 'danger')
            } else {
                Bert.alert(TAPi18n.__('pages.authenticate.recover-password.alerts.reset-password-sent-message'), 'success')
            }
        });

    }
});

function profileIsComplete(user){
  //console.log("user.profile.type: " + user.profile.type);
  if(typeof user.profile.type == 'undefined'){
    var profile = {
      username: user.profile.username,
      firstName: user.profile.firstName,
      lastName: user.profile.lastName,
      photo: user.profile.photo,
      bio: user.profile.bio,
      website: user.profile.website,
      //tags: user.profile.tags
    };
  }else{
    if(user.profile.type == 'Individual'){
      var profile = {
        username: user.profile.username,
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        photo: user.profile.photo,
        bio: user.profile.bio,
        website: user.profile.website,
        //tags: user.profile.tags
      };
    }else{
      var profile = {
        username: user.profile.username,
        firstName: user.profile.firstName,
        photo: user.profile.photo,
        bio: user.profile.bio,
        website: user.profile.website,
        phoneNumber: user.profile.phoneNumber,
        contactPerson: user.profile.contactPerson
        //credentials: template.templateDictionary.get('credentials'),
        //type: template.type.get(),
      }
    }
  }

  var isComplete = true;
  var profileFields = _.keys(profile);
  public = profile;
  //if (!profile.tags || profile.tags.length < 5){
  //  isComplete = false;
  //} else {
    _.map(profileFields, function(field){
      if (profile[field]){
        //console.log("profile[field]: " + profile[field]);
        if (profile[field].length == 0) {
          //console.log("profile[field]: " + profile[field] + " is breaking this.");
          isComplete = false;
        }
      } else {
        //console.log("!profile[field]: " + profile[field]);
        isComplete = false;
      }
    });
  //}
  //console.log("isComplete: " + isComplete)
  return isComplete;
}
