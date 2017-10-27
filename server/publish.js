Meteor.publish("users", function(){
  return Meteor.users.find({}, {fields: {services: 0}});
});