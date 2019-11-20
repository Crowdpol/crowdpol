import { check } from 'meteor/check';
import { Random } from 'meteor/random';
import { Ranks } from '../ranking/Ranks.js'
import { Notifications } from '../notifications/Notifications.js'
import { Communities } from '../communities/Communities.js'

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
    addAdminToCommunity: function(userId,communityId,isAdmin) {
      check(userId, String);
      check(communityId, String);
      check(isAdmin, String);
      //check if user exists
      let user = Meteor.users.findOne({_id: userId});
      if(user){
        //check if user is already a member of the community.
        let communityExists = Meteor.users.findOne({_id: userId,'profile.communityIds': communityId});
        if(!communityExists){
          Meteor.users.update({_id: userId}, {$push: {'profile.communityIds': communityId }});
        }
        let adminCommunityExists = Meteor.users.findOne({_id: userId,'profile.adminCommunities': communityId});
        if(adminCommunityExists){
          throw new Meteor.Error(422, 'User already an admin of this community');
        }else{
          Roles.addUsersToRoles(userId, 'community-admin');
          return Meteor.users.update({_id: userId}, {$push: {'profile.adminCommunities': communityId}});
        }
      }else{
        throw new Meteor.Error(422, 'Could not find user');
      }
    },
    removeAdminFromCommunity: function(userId,communityId) {
      check(userId, String);
      check(communityId, String);

      let user = Meteor.users.findOne({_id: userId});
      if(user){
        return Meteor.users.update({_id: user._id}, {$pull: {'profile.adminCommunities': communityId} });
      }
      return false;
    },
    addDelegateToCommunity: function(userId,communityId) {
      check(userId, String);
      check(communityId, String);
      //check if user exists
      let user = Meteor.users.findOne({_id: userId});
      if(user){
        //check if user is already a member of the community.
        let communityExists = Meteor.users.findOne({_id: userId,'profile.communityIds': communityId});
        if(!communityExists){
          throw new Meteor.Error(422, 'Could not find community');
        }
        let delegteCommunityExists = Meteor.users.findOne({_id: userId,'profile.delegateCommunities': communityId});
        if(adminCommunityExists){
          throw new Meteor.Error(422, 'User already a delegate of this community');
        }else{
          Roles.addUsersToRoles(userId, 'delegate');
          return Meteor.users.update({_id: userId}, {$push: {'profile.delegateCommunities': communityId}});
        }
      }else{
        throw new Meteor.Error(422, 'Could not find user');
      }
    },
    removeDelegateFromCommunity: function(userId,communityId) {
      check(userId, String);
      check(communityId, String);

      let user = Meteor.users.findOne({_id: userId});
      if(user){
        return Meteor.users.update({_id: user._id}, {$pull: {'profile.adminCommunities': communityId} });
      }
      return false;
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
      console.log(profile);
      searchString = profile.firstName + " " + profile.lastName + " " + profile.username;
      profile["searchString"] = searchString;
      var oldProfile = Meteor.user().profile;
      var newProfile = _.extend(oldProfile, profile);
      console.log(newProfile);
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
      let communityId = null;
      for (i=0; i<approvals.length; i++){
        if(approvals[i].id==requestId){
          approvals[i].status = status;
          approvals[i].reviewedBy = Meteor.userId();
          approvals[i].reviewedOn = new Date();
          type = approvals[i].type;
          communityId = approvals[i].communityId;
        }
      }
      Meteor.users.update({_id: userID}, {$set: {'approvals': approvals}});
      if(type&&status=='Approved'){
        if(type=='delegate'){
          let communityExists = Communities.find({"_id": communityId}).count();
          if(!communityExists){
            throw new Meteor.Error(422, 'Could not find community');
          }
          let delegteCommunityExists = Meteor.users.findOne({_id: userID,'profile.delegateCommunities': communityId});
          if(delegteCommunityExists){
            throw new Meteor.Error(422, 'User already a delegate of this community');
          }else{
            Roles.addUsersToRoles(userID, 'delegate');
            return Meteor.users.update({_id: userID}, {$push: {'profile.delegateCommunities': communityId}});
          }
        }
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
    requestApproval: function (userId, type, communityId) {
      check(userId, String);
      check(type, String);
      check(communityId, String);
      //don't create request unless profile is complete
      if (profileIsComplete(Meteor.user())) {
        //check if this user already has an approval of this type
        //users should only ever have one approval per
        var existingApprovalCount = Meteor.users.find({_id: userId,'approvals.type': type,"communityId":communityId}).count();
        if (existingApprovalCount == 0){
          let newApproval = {
            "id": Random.id(),
            "type" : type,
            "status" : "Requested",
            "createdAt" : new Date(),
            "communityId": communityId
          };
          Meteor.users.update({_id: Meteor.userId()}, {$push: {"approvals": newApproval}});
        }
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
        //get global community
        let community = Communities.findOne({subdomain: 'global'});
        //check if community found has id
        if(community){
          if(typeof community._id !=='undefined'){
            if(checkIfUserExists(email,community._id)){
              //console.log("user found");
            }else{
              //console.log("could not find email in community");
              testUser = {
                email:  email,
                password: Random.id(),
                profile: {
                  type: 'Individual',
                  communityIds: [community._id],
                  termsAccepted: false
                }
                //roles: ['test','mailing-list']
              };
              testUser._id = Meteor.call('addUser', testUser);
              Roles.addUsersToRoles(testUser._id, "newsletter");
              Meteor.call('sendNewsletterConfirmation',email,(error, response) => {
                if (error){
                  return false;
                } else {
                  return true
                }
              });
            }
          }else{
            //console.log("community id not determined");
          }
        }else{
          //console.log("global community not found");
        }
        return null;
        /*
        Meteor.call('getCommunityBySubdomain','global', (error, response) => {
          if (error){
            return false;
          } else {
            //check if email exists in community
            if(response){
              if(typeof response._id !=='undefined'){


              }
            }else{
              console.log("could not find global community");
            }

          }
        });
        */
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

    },
    updateUser(user) {
    // If the user being edited is also signed in
    if (user._id && (Meteor.userId() == user._id)) {
      var id = user._id
      delete user._id
      // Check that all the keys are allowed to be updated
      // The user._id key is first deleted so that this check can pass.
      var keysAreValid = Object.keys(user).every((field) => {
        // Only allow latitude and longitude to be updated
        return ["latitude", "longitude"].indexOf(field) != -1
      })
      if (keysAreValid) {
        // Send an update to the server if the keys are acceptable
        Meteor.users.update(id, { $set: user, });
      }  else {
        // Throw an error if the keys are invalid
        throw new Error("invalid update fields to user")
      }
    } else {
      // Throw an error if the user being updated isn't signed in
      throw new Error("invalid userId to update user")
    }
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

function checkIfUserExists(email,communityId) {
  let user = Accounts.findUserByEmail(email);
  if (typeof user === 'undefined' || user === null) {
      return false;// variable is undefined or null
  }else{
    let userMatch = Meteor.users.findOne({_id: user._id}, {$push: {'profile.communityIds': communityId} });
    if(userMatch){
      console.log(userMatch);
      return true;
    }
    return false;
  }
}
