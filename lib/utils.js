import { Meteor } from 'meteor/meteor';
//import { Session } from 'meteor/session';

//Global Methods

//Returns current app language
getUserLanguage = function () {
  // Put here the logic for determining the user language
  return $LANGUAGE;
};

// converts a String to slug-like-text.
export const convertToSlug = function (text) {
  if (text !== undefined) {
    return text
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
  }
  return '';
};
