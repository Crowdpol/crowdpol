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

//IntroJs tutorial guide
export const walkThrough = (steps) => {
  var intro = introJs();
  intro.setOptions({
    steps: steps
  });
  intro.start();
}

export const timeRemaining = (finalDate) => {
    var eventdate = moment(finalDate);
    var todaysdate = moment();
    return eventdate.diff(todaysdate, 'days');
}

export const daysRemaining = (finalDate) => {
    var eventdate = moment(finalDate);
    console.log(moment(finalDate).fromNow());
    var todaysdate = moment();
    return eventdate.diff(todaysdate, 'days');
}

//function to check if object has key
export const hasOwnProperty = (obj,prop) => {
  var proto = obj.__proto__ || obj.constructor.prototype;
  return (prop in obj) && (!(prop in proto) || proto[prop] !== obj[prop]);
};