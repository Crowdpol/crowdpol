import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Profiles } from "./Profiles.js"
import { Random } from 'meteor/random'

Meteor.methods({
  'user.current'() {
    var user = Meteor.users.findOne({"_id":Meteor.userId()});
    if(user){
      return user;
    }
    throw new Meteor.Error('Could not find user', Meteor.userId());
    return;
  },
  'profiles.initiate'(userId,profile) {
    check(userId, String);
    console.log("Initiate called: " + userId);
    console.log(profile);
    var exists = Profiles.findOne({"userId":userId});
    if(exists){
      throw new Meteor.Error('Profile Exists', 'You can only have one profile.');
      return false;
    }else{ 
      console.log("adding this person: " + userId);
      try{
        Profiles.insert({  
            userId: userId,   
            isPublic: false,
            photo: profile.picture,
            name: profile.firstName + " " + profile.lastName,
            website: '',
            bio: '',
            canDelegate: false,
            isDelegate: false,
            isCandidate: false,
            isOrganisation: false,
        });
      } catch (e) {
        throw new Meteor.Error(e);
      }
      
      console.log("inserted the following profile: ");
      console.log(profileId);
    }
  },

  'profiles.initiate_demo'(userId) {
    console.log("Initiate Demo called: " + userId);
    var user = Meteor.users.findOne({"_id":userId});
    
    var count = Profiles.find({"userId":userId}).count();
    if(count > 1){
      throw new Meteor.Error('Profile Exists', 'You can only have one profile.');
    }
    check(userId, String);
    var exists = Profiles.findOne({"userId":userId});
    if(exists)
     {
        console.log('Already Exists', 'First Test failed.');
     }else{ 
        console.log("add: " + userId);
        var verbs = ["Hope", "Build", "Surf for", "Hands of"], 
          causes = [" the Earth", " the Children", " the Environment", " the Future"],
          lorem = ['Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.','Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.','Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',' Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.']
        var isOrg = Math.random() >= 0.5;
        newBio = Random.choice(lorem) + Random.choice(lorem);
        if(isOrg){
          newName = Random.choice(verbs) + Random.choice(causes);
          newPic = "https://unsplash.it/400/400?image=" + Math.floor((Math.random()*100));
          isCan = false;
        }else{
          newName = user.profile.firstName + " " + user.profile.lastName;
          newPic = "https://unsplash.it/400/400?image=" + Math.floor((Math.random()*100));
          isCan = Math.random() >= 0.5;
        }

        const linksId = Profiles.insert({  
        	userId: userId,   
        	isPublic: true,
          photo: newPic,
          name: newName,
          website: 'http://' + user.profile.firstName + user.profile.lastName + ".com/",
          bio: newBio,
          canDelegate: Math.random() >= 0.5,
          isDelegate: Math.random() >= 0.5,
          isCandidate: isCan,
          isOrganisation: isOrg,
        });
        console.log(linksId);
     }
  },
  'profiles.current'() {
    return Profiles.findOne({"userId":Meteor.user()});
  },
  'profiles.public'(){
    return Profiles.findOne({"userId":Meteor.user()}).isPublic;
  },
  'user.specific'(id){
    return Meteor.users.findOne({"userId":id});
  }
});