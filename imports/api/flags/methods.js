import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Flags } from './Flags.js';
import { convertToSlug } from '../../utils/functions';

Meteor.methods({
    addFlag: function (flag) {
      check(flag.contentType, String);
      check(flag.contentId, String);
      check(flag.creatorId, String);
      check(flag.flaggerId, String);
      check(flag.category, String);
      check(flag.justification, String);
      check(flag.status, String);
      check(flag.outcome, String);
      check(flag.communityId, String);
      check(flag.other, String);
      if(flag.status=='other'){
        check(flag.status,String);
      }
      return Flags.insert({ 
        contentType: flag.contentType, 
        contentId: flag.contentId, 
        creatorId: flag.creatorId, 
        flaggerId: flag.flaggerId, 
        category: flag.category,
        justification: flag.justification,
        status: flag.status, 
        outcome: flag.outcome, 
        communityId: flag.communityId,
        other: flag.other
      });
    },
    getFlag: function(flagID){
      check(flagID, String);
      return Flags.findOne({_id: flagID});
    },
    deleteFlag: function (flagID) {
      check(flagID, String);
      Flags.remove(flagID);
    },
});