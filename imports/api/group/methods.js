import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Groups } from './Groups.js';
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
      return Groups.insert({
        name: group.name,
        handle: group.handle,
        isOpen: group.isOpen,
        communityId: group.communityId,
        admins: [Meteor.userId()],
        members:[Meteor.userId()],
        photo: "/img/default-user-image.png",
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
