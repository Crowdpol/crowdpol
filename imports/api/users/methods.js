import { check } from 'meteor/check';
import { Random } from 'meteor/random';

Meteor.methods({

    addUser: function (newUser) {
      //console.log("method addUser called");
      check(newUser, { email: String, password: String });
      userId = Accounts.createUser(newUser);
      return userId;
    },
    isPublic: function (userId) {
      check(userID, String);
      user = Meteor.users.findOne({_id: Meteor.userId()},{fields: {profile: 1,roles: 1,isPublic: 1,isParty: 1,isOrganisation: 1}});;
      //console.log("isPublic: " + user.isPublic);
      return user.isPublic;
    },
    getUser: function (userID) {
      //console.log("method getUser called");
      check(userID, String);
      const users = Meteor.users.find({_id: userID}).fetch();
        return users[0];
    },
    deleteUser: function (userID) {
      //console.log("method deleteUser called");
      check(userID, String);
      Meteor.users.remove({_id:userID});
    },
    getProfile: function (userID) {
      //console.log("method getUserProfile called: " + userID);
      check(userID, String);
      const users = Meteor.users.find({_id: userID},{fields: {profile: 1, isPublic:1}}).fetch();
      //console.log(users);
      return users[0];
    },
    getUserTags: function(userID) {
      check(userID, String);
      const users = Meteor.users.find({_id: userID},{fields: {profile: 1}}).fetch();
      return users[0].profile.tags;
    },
    updateProfile: function (userID, profile) {
      //console.log(profile);
      check(userID, String);
      searchString = profile.firstName + " " + profile.lastName + " " + profile.username;
      profile["searchString"] = searchString;
      Meteor.users.update({_id: userID}, {$set: {"profile": profile}});
    },
    togglePublic: function (userID,isPublic) {
      check(userID, String);
      check(isPublic, Boolean);
      Meteor.users.update({_id: userID}, {$set: {"isPublic": isPublic}});
    },
    addEntity: function(entity) {
      check(entity, { email: String, password: String });
      entityID = Accounts.createUser({
        'email': entity.email,
        'password': entity.password,
        'isPublic' : false
        });

      // Update profile
      profile = {'firstName': entity.name,
      'website': entity.website,
      'phoneNumber': entity.phone,
      'contactPerson': entity.contact,
      'type': entity.profileType,
      //'username': generateUs"approvals": {$exists: true}, $where : "this.approvals.length > 0"})ername(entity.name),
      'searchString': entity.name //+ ' ' + generateUsername(entity.name)
      };

      Meteor.call('updateProfile', entityID, profile);

      // Add entity to role
      Roles.addUsersToRoles(entityID, entity.roles);

      return entityID;

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
    approveUser: function(userID, requestId, status, approverID){
      check(userID, String);
      check(requestId, String);
      check(approverId, String);
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
    },
    requestApproval: function (userID,type) {
      check(userID, String);
      check(type, String);
      //get current user approvalReqeusts
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
    },
    toggleRole: function (userID,role,state) {
      check(userID, String);
      check(role, String);
      check(state, Boolean);
      if(state){
        console.log("adding role: " + role);
        Roles.addUsersToRoles(Meteor.userId(), role);
      }else{
        console.log("removing role: " + role);
        Roles.removeUsersFromRoles(Meteor.userId(), role);
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
      var result = Meteor.users.find( { $text: { $search: search } } )
      console.log(result);
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
    addTagToProfile: function(userId, tag) {
      check(userID, String);
      check(tag, String);
      Meteor.users.update({_id: userId}, {$push: {'profile.tags': tag} });
    },
    removeTagFromProfile: function(userId, tag) {
      check(userID, String);
      check(tag, String);
      Meteor.users.update({_id: userId}, {$pull: {'profile.tags': tag} });
    },
});


