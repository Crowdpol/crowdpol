import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Group } from './Group.js';
import { convertToSlug } from '../../utils/functions';

Meteor.methods({
    addGroup: function (group) {
      check(group, {
        name: String,
        handle: String,
        isOpen: Boolean,
        communityId: String,
        isArchived: Match.Maybe(Boolean),
      });
      console.log(group);
      return Group.insert({
        name: flag.contentType,
        handle: flag.contentId,
        isOpen: flag.creatorId,
        communityId: Meteor.userId(),
        admins: [Meteor.userId()],
        members:[Meteor.userId()]
      });

    },
    deleteGroup: function (id) {
      /*
      check(flagID, String);
      Groupss.remove(id);
      */
      console.log(id);
    },
});
