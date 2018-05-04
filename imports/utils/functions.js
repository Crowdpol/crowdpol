import { _ } from 'meteor/underscore';

export const buildRegExp = function (searchText) {
  const words = searchText.trim().split(/[ \-:]+/);
  const exps = _.map(words, function(word) {
    return `(?=.*${word})`;
  });
  const fullExp = exps.join('') + '.+';
  return new RegExp(fullExp, 'i');
};

// converts a String to slug-like-text.
export const convertToSlug = (text) => {
  if (text !== undefined) {
    return text
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^a-zA-Z0-9àâäèéêëîïôöœùûüÿçÀÂÄÈÉÊËÎÏÔŒÙÛÜŸÇ\-]+/g, '')
        ;
  }
  return undefined;
};
