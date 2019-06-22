import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Group } from './Group.js';
import { convertToSlug } from '../../utils/functions';

Meteor.methods({
    addGroup: function (group) {
      /*
      check(flag.contentType, String);
      return Group.insert({
        contentType: flag.contentType,
        contentId: flag.contentId,
        creatorId: flag.creatorId,
        flaggerId: Meteor.userId(),
        category: flag.category,
        //justification: '',
        status: 'pending',
        //outcome: flag.outcome,
        communityId: flag.communityId,
        other: flag.other
      });
      */
      console.log(group);
    },
    deleteGroup: function (id) {
      /*
      check(flagID, String);
      Groupss.remove(id);
      */
      console.log(id);
    },
});
