import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Flags } from './Flags.js';
import { convertToSlug } from '../../utils/functions';

Meteor.methods({
    addFlag: function (flag) {
      check(flag, {
        contentType: String,
        contentId: String,
        creatorId: String,
        flaggerId: String,
        justification: String,
        status: String,
        outcome: String,
        communityId: String,
        other: String
      });
      if(flag.status=='other'){
        check(flag.status,String);
      }
      return Flags.insert({ 
        contentType: flag.contentType, 
        contentId: flag.contentId, 
        creatorId: flag.creatorId, 
        flaggerId: flag.flaggerId, 
        status: flag.status, 
        outcome: flag.outcome, 
        communityId: flag.communityId,
        other: flag.other
      });
    },
    getFlag: function(flagID){
      check(tagID, String);
      return Flags.findOne({_id: flagID});
    },
    deleteFlag: function (flagID) {
      check(flagID, String);
      Flags.remove(flagID);
    },
});