import { _ } from 'meteor/underscore';

export const username = (id) => {
  let user = returnUser(id);
  if(user){
    profile = returnProfile(user);
    if(profile){
      let username = returnProfileKey(profile,'username');
      if(username){
        return username;
      }
    }
  }
  return false;
};

export const userfullname = (id) => {
  let user = returnUser(id);
  let fullname;
  if(user){
    profile = returnProfile(user);
    if(profile){
      let firstname = returnProfileKey(profile,'firstName');
      let lastname = returnProfileKey(profile,'lastName');
      if(firstname){
        fullname = firstname;
      }
      if(lastname){
        fullname = fullname + " " + lastname;
      }
      if(fullname){
        return fullname;
      }
    }
  }
  return false;
};

export const userProfilePhoto = (id) => {
  let user = returnUser(id);
  if(user){
    profile = returnProfile(user);
    if(profile){
      let photoURL = returnProfileKey(profile,'photo');
      return photoURL;
    }
  }
  return "/img/default-user-image.png";;
};

//check if user has cover, if true, return coverURL or return false
export const userHasCover = (id) => {
  let user = returnUser(id);
  if(user){
    profile = returnProfile(user);
    if(profile){
      if(returnProfileKey(profile,'hasCover')){
        return returnProfileKey(profile,'coverURL')
      }
    }
  }
  return false;
};
//returns user cover
export const userCover = (id) => {
  let user = returnUser(id);
  if(user){
    profile = returnProfile(user);
    if(profile){
      return returnProfileKey(profile,'coverURL');
    }
  }
  return false;
};

//returns user tags/interests
export const userTags = (id) => {
  let user = returnUser(id);
  if(user){
    profile = returnProfile(user);
    if(profile){
      return returnProfileKey(profile,'tags');
    }
  }
  return false;
};

//returns user tags/interests
export const getUserIdByUsername = (username) => {
  let user = returnUserByUsername(username);
  if(user){
    Bert.alert("user id: " + user._id,"success");
    return user;
  }
  //Bert.alert("can't match usernmae","caution");
  return false;
};

//returns user by id, or current user
function returnUser(id){
  let user;

  if (id !== undefined) {
    user = Meteor.users.findOne({"_id":id});
  }/*
  else{
    //Bert.alert("current user","caution");
    user = Meteor.user();
  }*/
  return user;
}

function returnUserByUsername(username){
  let user;

  if (username !== undefined) {

    user = Meteor.users.findOne({"profile.username" :username});
    Bert.alert(user,"success");
  }/*
  else{
    //Bert.alert("current user","caution");
    user = Meteor.user();
  }*/
  return user;
}

//returns user profile if it exists
function returnProfile(user){
  let profile;
  if(typeof user.profile !== undefined){
    profile = user.profile;
  }
  return profile;
}
//returns key from profile if it exists
function returnProfileKey(profile,key){
  if(profile && key){
    if (profile.hasOwnProperty(key)){
      //Bert.alert("key: " + key + " ,profile.key: " + profile[key],'danger');
      return profile[key];
    }
  }
  return false;
}

function profileComplete(){
  let user = Meteor.user();
  let complete = false;
}
